-- ============================================================================
-- DYNAMIC SLOT CAPACITY
-- slot_availability previously hardcoded a capacity of 4 per slot. Now it
-- reads the `capacity_per_slot` setting (seeded default 4) so the admin CMS
-- setting actually takes effect.
-- ============================================================================

create or replace function public.slot_availability(_date date, _mode text default 'pickup')
returns table (slot text, remaining int)
language sql stable security definer set search_path = public as $$
  select s.slot,
         greatest(0, cap.capacity - (
           select count(*)::int from public.bookings b
           where b.pickup_date = _date and b.pickup_slot = s.slot
             and b.mode = _mode and b.status <> 'cancelled'
         )) as remaining
  from (values ('8:00 – 10:00 AM'),('10:00 – 12:00 PM'),('12:00 – 2:00 PM'),
               ('2:00 – 4:00 PM'),('4:00 – 6:00 PM'),('6:00 – 8:00 PM')) as s(slot)
  cross join lateral (
    select greatest(1, coalesce(
      nullif((select value #>> '{}' from public.settings where key = 'capacity_per_slot'), '')::int,
      4
    )) as capacity
  ) cap;
$$;

grant execute on function public.slot_availability(date, text) to anon, authenticated;
