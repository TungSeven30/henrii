create or replace function public.current_user_is_baby_owner(target_baby_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.babies b
    where b.id = target_baby_id
      and b.owner_id = auth.uid()
  );
$$;

create or replace function public.current_user_is_accepted_caregiver(target_baby_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.caregivers c
    where c.baby_id = target_baby_id
      and c.user_id = auth.uid()
      and c.invite_status = 'accepted'
  );
$$;

revoke all on function public.current_user_is_baby_owner(uuid) from public;
revoke all on function public.current_user_is_accepted_caregiver(uuid) from public;
grant execute on function public.current_user_is_baby_owner(uuid) to authenticated;
grant execute on function public.current_user_is_accepted_caregiver(uuid) to authenticated;

drop policy if exists "babies_select_authorized" on public.babies;
create policy "babies_select_authorized"
on public.babies
for select
using (
  owner_id = auth.uid()
  or public.current_user_is_accepted_caregiver(babies.id)
);

drop policy if exists "caregivers_select_authorized" on public.caregivers;
create policy "caregivers_select_authorized"
on public.caregivers
for select
using (
  user_id = auth.uid()
  or public.current_user_is_baby_owner(caregivers.baby_id)
);

drop policy if exists "caregivers_insert_owner_only" on public.caregivers;
create policy "caregivers_insert_owner_only"
on public.caregivers
for insert
with check (public.current_user_is_baby_owner(caregivers.baby_id));

drop policy if exists "caregivers_update_owner_only" on public.caregivers;
create policy "caregivers_update_owner_only"
on public.caregivers
for update
using (public.current_user_is_baby_owner(caregivers.baby_id))
with check (public.current_user_is_baby_owner(caregivers.baby_id));

drop policy if exists "caregivers_delete_owner_only" on public.caregivers;
create policy "caregivers_delete_owner_only"
on public.caregivers
for delete
using (public.current_user_is_baby_owner(caregivers.baby_id));
