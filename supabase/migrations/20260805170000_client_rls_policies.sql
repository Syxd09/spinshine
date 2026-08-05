-- ============================================================================
-- CLIENT RLS POLICIES MIGRATION
-- Enables safe, role-authorized direct writes from the client-side Supabase client.
-- ============================================================================

-- 1) Services, Localities, Settings, CMS Content
create policy "Admins can insert services" on public.services for insert to authenticated with check (public.current_role() = 'admin');
create policy "Admins can update services" on public.services for update to authenticated using (public.current_role() = 'admin');
create policy "Admins can delete services" on public.services for delete to authenticated using (public.current_role() = 'admin');

create policy "Admins can insert localities" on public.localities for insert to authenticated with check (public.current_role() = 'admin');
create policy "Admins can update localities" on public.localities for update to authenticated using (public.current_role() = 'admin');
create policy "Admins can delete localities" on public.localities for delete to authenticated using (public.current_role() = 'admin');

create policy "Admins can insert settings" on public.settings for insert to authenticated with check (public.current_role() = 'admin');
create policy "Admins can update settings" on public.settings for update to authenticated using (public.current_role() = 'admin');
create policy "Admins can delete settings" on public.settings for delete to authenticated using (public.current_role() = 'admin');

create policy "Admins can insert cms_content" on public.cms_content for insert to authenticated with check (public.current_role() = 'admin');
create policy "Admins can update cms_content" on public.cms_content for update to authenticated using (public.current_role() = 'admin');
create policy "Admins can delete cms_content" on public.cms_content for delete to authenticated using (public.current_role() = 'admin');

-- 2) Profiles
create policy "Admins read all profiles" on public.profiles for select to authenticated using (public.current_role() = 'admin');
create policy "Admins update all profiles" on public.profiles for update to authenticated using (public.current_role() = 'admin');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- 3) Bookings
create policy "Customers insert own bookings" on public.bookings for insert to authenticated with check (customer_id = auth.uid());
create policy "Admins insert all bookings" on public.bookings for insert to authenticated with check (public.current_role() = 'admin');
create policy "Admins update all bookings" on public.bookings for update to authenticated using (public.current_role() = 'admin');
create policy "Staff update assigned bookings" on public.bookings for update to authenticated using (
  exists (select 1 from public.profiles p
          where p.id = auth.uid()
            and (p.role = 'admin'
                 or (p.role = 'technician' and assigned_technician_id = auth.uid())
                 or (p.role = 'driver' and assigned_driver_id = auth.uid())))
);

-- 4) Payments
create policy "Customers insert own payments" on public.payments for insert to authenticated with check (
  exists (select 1 from public.bookings b where b.id = booking_id and b.customer_id = auth.uid())
);
create policy "Admins insert all payments" on public.payments for insert to authenticated with check (public.current_role() = 'admin');
create policy "Admins update all payments" on public.payments for update to authenticated using (public.current_role() = 'admin');
