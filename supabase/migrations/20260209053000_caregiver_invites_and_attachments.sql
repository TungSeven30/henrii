create table if not exists public.caregiver_invites (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  email text not null,
  role text not null default 'caregiver' check (role in ('admin', 'caregiver')),
  token text not null unique,
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invite_rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointment_attachments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  file_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists caregiver_invites_baby_email_idx
on public.caregiver_invites(baby_id, lower(email), created_at desc);

create index if not exists invite_rate_limits_user_created_idx
on public.invite_rate_limits(user_id, created_at desc);

create index if not exists appointment_attachments_appointment_idx
on public.appointment_attachments(appointment_id, created_at desc);

alter table public.caregiver_invites enable row level security;
alter table public.invite_rate_limits enable row level security;
alter table public.appointment_attachments enable row level security;

create policy "caregiver_invites_select_owner_or_invitee"
on public.caregiver_invites
for select
using (
  invited_by = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or exists (
    select 1
    from public.babies b
    where b.id = caregiver_invites.baby_id
      and b.owner_id = auth.uid()
  )
);

create policy "caregiver_invites_insert_owner_only"
on public.caregiver_invites
for insert
with check (
  invited_by = auth.uid()
  and exists (
    select 1
    from public.babies b
    where b.id = caregiver_invites.baby_id
      and b.owner_id = auth.uid()
  )
);

create policy "caregiver_invites_update_owner_or_invitee"
on public.caregiver_invites
for update
using (
  invited_by = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or exists (
    select 1
    from public.babies b
    where b.id = caregiver_invites.baby_id
      and b.owner_id = auth.uid()
  )
)
with check (
  invited_by = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or exists (
    select 1
    from public.babies b
    where b.id = caregiver_invites.baby_id
      and b.owner_id = auth.uid()
  )
);

create policy "invite_rate_limits_select_own"
on public.invite_rate_limits
for select
using (user_id = auth.uid());

create policy "invite_rate_limits_insert_own"
on public.invite_rate_limits
for insert
with check (user_id = auth.uid());

create policy "appointment_attachments_select_authorized"
on public.appointment_attachments
for select
using (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
);

create policy "appointment_attachments_insert_authorized"
on public.appointment_attachments
for insert
with check (
  uploaded_by = auth.uid()
  and baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
);

create policy "appointment_attachments_delete_owner_or_admin"
on public.appointment_attachments
for delete
using (
  uploaded_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('appointment-attachments', 'appointment-attachments', false, 52428800)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

create policy "storage_attachment_select_authorized"
on storage.objects
for select
using (
  bucket_id = 'appointment-attachments'
  and exists (
    select 1
    from public.babies b
    where b.id::text = split_part(name, '/', 1)
      and (
        b.owner_id = auth.uid()
        or exists (
          select 1
          from public.caregivers c
          where c.baby_id = b.id
            and c.user_id = auth.uid()
            and c.invite_status = 'accepted'
        )
      )
  )
);

create policy "storage_attachment_insert_authorized"
on storage.objects
for insert
with check (
  bucket_id = 'appointment-attachments'
  and owner = auth.uid()
  and exists (
    select 1
    from public.babies b
    where b.id::text = split_part(name, '/', 1)
      and (
        b.owner_id = auth.uid()
        or exists (
          select 1
          from public.caregivers c
          where c.baby_id = b.id
            and c.user_id = auth.uid()
            and c.invite_status = 'accepted'
        )
      )
  )
);

create policy "storage_attachment_delete_authorized"
on storage.objects
for delete
using (
  bucket_id = 'appointment-attachments'
  and (
    owner = auth.uid()
    or exists (
      select 1
      from public.babies b
      where b.id::text = split_part(name, '/', 1)
        and b.owner_id = auth.uid()
    )
  )
);
