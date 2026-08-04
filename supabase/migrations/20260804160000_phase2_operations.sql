-- ============================================================================
-- PHASE 2: OPERATIONS
-- Expands bookings for end-to-end service: customer linkage, item quantities,
-- technician/driver assignments, a status-history trail, and a payments table.
-- Enables the customer account portal and the technician/driver dashboards.
-- ============================================================================

-- 1) Expand BOOKINGS ---------------------------------------------------------
alter table public.bookings
  add column if not exists customer_id uuid references auth.users(id) on delete set null,
  add column if not exists qty integer not null default 1 check (qty >= 1),
  add column if not exists line_items jsonb not null default '[]'::jsonb,
  add column if not exists assigned_technician_id uuid references auth.users(id) on delete set null,
  add column if not exists assigned_driver_id uuid references auth.users(id) on delete set null,
  add column if not exists status_history jsonb not null default '[]'::jsonb,
  add column if not exists cancellation_reason text;

comment on column public.bookings.qty is 'Primary quantity requested by the customer.';
comment on column public.bookings.line_items is 'Itemized breakdown of services/quantities/rates used for the estimate.';
comment on column public.bookings.status_history is 'Append-only trail of status transitions (auto-maintained).';

create index if not exists bookings_customer_idx on public.bookings (customer_id);
create index if not exists bookings_technician_idx on public.bookings (assigned_technician_id) where assigned_technician_id is not null;
create index if not exists bookings_driver_idx on public.bookings (assigned_driver_id) where assigned_driver_id is not null;

-- Auto-maintain status_history on every status change.
create or replace function public.append_status_history()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  hist jsonb := coalesce(new.status_history, '[]'::jsonb);
  by_id uuid := auth.uid();
  by_role text := null;
begin
  if old.status is distinct from new.status then
    select role into by_role from public.profiles where id = by_id;
    hist := hist || jsonb_build_object(
      'status', new.status,
      'at', now(),
      'by', by_id,
      'byRole', by_role
    );
    new.status_history := hist;
  end if;
  return new;
end; $$;

drop trigger if exists bookings_status_history on public.bookings;
create trigger bookings_status_history
  before update of status on public.bookings
  for each row execute function public.append_status_history();

-- 2) PAYMENTS ----------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  method text not null default 'cash' check (method in ('upi','card','cash')),
  amount integer not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','paid','refunded')),
  received_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_booking_idx on public.payments (booking_id);

alter table public.payments enable row level security;

create policy "Payments readable by staff"
  on public.payments for select to authenticated using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('admin','technician'))
  );

grant select on public.payments to authenticated;
grant all on public.payments to service_role;

-- 3) BOOKINGS RLS for the account portal ------------------------------------
-- Customers may read their own bookings; staff may read what is assigned to
-- them (admins see everything). All mutations still happen via service-role
-- server functions; RLS here covers safe reads only.

create policy "Customers read own bookings"
  on public.bookings for select to authenticated using (customer_id = auth.uid());

create policy "Staff read assigned bookings"
  on public.bookings for select to authenticated using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid()
              and (p.role = 'admin'
                   or (p.role = 'technician' and assigned_technician_id = auth.uid())
                   or (p.role = 'driver' and assigned_driver_id = auth.uid())))
  );