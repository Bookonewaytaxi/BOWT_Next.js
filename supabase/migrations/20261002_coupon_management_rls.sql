-- Coupon management RLS
-- Keeps public coupon validation readable while allowing authenticated admin users
-- to create, update and delete coupons through the existing Supabase client.
alter table public.coupons enable row level security;

drop policy if exists "Public can read active coupons" on public.coupons;
create policy "Public can read active coupons"
on public.coupons
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Authenticated users can read coupons" on public.coupons;
create policy "Authenticated users can read coupons"
on public.coupons
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert coupons" on public.coupons;
create policy "Authenticated users can insert coupons"
on public.coupons
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update coupons" on public.coupons;
create policy "Authenticated users can update coupons"
on public.coupons
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete coupons" on public.coupons;
create policy "Authenticated users can delete coupons"
on public.coupons
for delete
to authenticated
using (true);
