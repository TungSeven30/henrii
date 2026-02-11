create or replace function public.baby_has_premium(target_baby_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  owner_uuid uuid;
  owner_plan text;
  owner_status text;
  is_authorized boolean := false;
begin
  if auth.uid() is null then
    return false;
  end if;

  select b.owner_id
  into owner_uuid
  from public.babies b
  where b.id = target_baby_id;

  if owner_uuid is null then
    return false;
  end if;

  is_authorized := owner_uuid = auth.uid() or exists (
    select 1
    from public.caregivers c
    where c.baby_id = target_baby_id
      and c.user_id = auth.uid()
      and c.invite_status = 'accepted'
  );

  if not is_authorized then
    return false;
  end if;

  select s.plan, s.status
  into owner_plan, owner_status
  from public.subscriptions s
  where s.user_id = owner_uuid;

  return coalesce(owner_plan, 'free') = 'premium'
    and coalesce(owner_status, 'active') = 'active';
end;
$$;

create or replace function public.caregiver_write_allowed(target_baby_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  owner_uuid uuid;
begin
  if auth.uid() is null then
    return false;
  end if;

  select b.owner_id
  into owner_uuid
  from public.babies b
  where b.id = target_baby_id;

  if owner_uuid is null then
    return false;
  end if;

  if owner_uuid = auth.uid() then
    return true;
  end if;

  if not exists (
    select 1
    from public.caregivers c
    where c.baby_id = target_baby_id
      and c.user_id = auth.uid()
      and c.invite_status = 'accepted'
  ) then
    return false;
  end if;

  return public.baby_has_premium(target_baby_id);
end;
$$;

revoke all on function public.baby_has_premium(uuid) from public;
revoke all on function public.caregiver_write_allowed(uuid) from public;
grant execute on function public.baby_has_premium(uuid) to authenticated;
grant execute on function public.caregiver_write_allowed(uuid) to authenticated;

drop policy if exists "feedings_insert_authorized" on public.feedings;
drop policy if exists "feedings_update_authorized" on public.feedings;
drop policy if exists "feedings_delete_authorized" on public.feedings;

create policy "feedings_insert_authorized"
on public.feedings
for insert
with check (
  logged_by = auth.uid()
  and public.caregiver_write_allowed(baby_id)
);

create policy "feedings_update_authorized"
on public.feedings
for update
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
)
with check (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

create policy "feedings_delete_authorized"
on public.feedings
for delete
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

drop policy if exists "sleep_insert_authorized" on public.sleep_sessions;
drop policy if exists "sleep_update_authorized" on public.sleep_sessions;
drop policy if exists "sleep_delete_authorized" on public.sleep_sessions;

create policy "sleep_insert_authorized"
on public.sleep_sessions
for insert
with check (
  logged_by = auth.uid()
  and public.caregiver_write_allowed(baby_id)
);

create policy "sleep_update_authorized"
on public.sleep_sessions
for update
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
)
with check (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

create policy "sleep_delete_authorized"
on public.sleep_sessions
for delete
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

drop policy if exists "diaper_insert_authorized" on public.diaper_changes;
drop policy if exists "diaper_update_authorized" on public.diaper_changes;
drop policy if exists "diaper_delete_authorized" on public.diaper_changes;

create policy "diaper_insert_authorized"
on public.diaper_changes
for insert
with check (
  logged_by = auth.uid()
  and public.caregiver_write_allowed(baby_id)
);

create policy "diaper_update_authorized"
on public.diaper_changes
for update
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
)
with check (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

create policy "diaper_delete_authorized"
on public.diaper_changes
for delete
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

drop policy if exists "vaccinations_insert_authorized" on public.vaccinations;
drop policy if exists "vaccinations_update_authorized" on public.vaccinations;

create policy "vaccinations_insert_authorized"
on public.vaccinations
for insert
with check (
  logged_by = auth.uid()
  and public.caregiver_write_allowed(baby_id)
);

create policy "vaccinations_update_authorized"
on public.vaccinations
for update
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
)
with check (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

drop policy if exists "appointments_insert_authorized" on public.appointments;
drop policy if exists "appointments_update_authorized" on public.appointments;

create policy "appointments_insert_authorized"
on public.appointments
for insert
with check (
  created_by = auth.uid()
  and public.caregiver_write_allowed(baby_id)
);

create policy "appointments_update_authorized"
on public.appointments
for update
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (created_by = auth.uid() and public.caregiver_write_allowed(baby_id))
)
with check (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (created_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

drop policy if exists "growth_measurements_insert_authorized" on public.growth_measurements;
drop policy if exists "growth_measurements_update_authorized" on public.growth_measurements;
drop policy if exists "growth_measurements_delete_authorized" on public.growth_measurements;

create policy "growth_measurements_insert_authorized"
on public.growth_measurements
for insert
with check (
  logged_by = auth.uid()
  and public.caregiver_write_allowed(baby_id)
);

create policy "growth_measurements_update_authorized"
on public.growth_measurements
for update
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
)
with check (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

create policy "growth_measurements_delete_authorized"
on public.growth_measurements
for delete
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

drop policy if exists "developmental_milestones_insert_authorized" on public.developmental_milestones;
drop policy if exists "developmental_milestones_update_authorized" on public.developmental_milestones;
drop policy if exists "developmental_milestones_delete_authorized" on public.developmental_milestones;

create policy "developmental_milestones_insert_authorized"
on public.developmental_milestones
for insert
with check (
  logged_by = auth.uid()
  and public.caregiver_write_allowed(baby_id)
);

create policy "developmental_milestones_update_authorized"
on public.developmental_milestones
for update
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
)
with check (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

create policy "developmental_milestones_delete_authorized"
on public.developmental_milestones
for delete
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (logged_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

drop policy if exists "appointment_attachments_insert_authorized" on public.appointment_attachments;
drop policy if exists "appointment_attachments_delete_owner_or_admin" on public.appointment_attachments;

create policy "appointment_attachments_insert_authorized"
on public.appointment_attachments
for insert
with check (
  uploaded_by = auth.uid()
  and public.caregiver_write_allowed(baby_id)
);

create policy "appointment_attachments_delete_owner_or_admin"
on public.appointment_attachments
for delete
using (
  baby_id in (select id from public.babies where owner_id = auth.uid())
  or (uploaded_by = auth.uid() and public.caregiver_write_allowed(baby_id))
);

drop policy if exists "storage_attachment_insert_authorized" on storage.objects;
drop policy if exists "storage_attachment_delete_authorized" on storage.objects;

create policy "storage_attachment_insert_authorized"
on storage.objects
for insert
with check (
  bucket_id = 'appointment-attachments'
  and owner = auth.uid()
  and split_part(name, '/', 1) ~* '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
  and public.caregiver_write_allowed((split_part(name, '/', 1))::uuid)
);

create policy "storage_attachment_delete_authorized"
on storage.objects
for delete
using (
  bucket_id = 'appointment-attachments'
  and split_part(name, '/', 1) ~* '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
  and (
    exists (
      select 1
      from public.babies b
      where b.id = (split_part(name, '/', 1))::uuid
        and b.owner_id = auth.uid()
    )
    or (owner = auth.uid() and public.caregiver_write_allowed((split_part(name, '/', 1))::uuid))
  )
);
