create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  locale text not null default 'en' check (locale in ('en', 'vi')),
  timezone text not null default 'UTC',
  active_baby_id uuid,
  deleted_at timestamptz,
  purge_after timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.babies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  date_of_birth date not null,
  sex text not null default 'unknown' check (sex in ('male', 'female', 'other', 'unknown')),
  country_code text not null default 'US',
  timezone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.caregivers (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'caregiver' check (role in ('admin', 'caregiver')),
  invite_status text not null default 'pending' check (invite_status in ('pending', 'accepted', 'revoked')),
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (baby_id, user_id),
  unique (baby_id, email)
);

create table if not exists public.deletion_jobs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  scheduled_for timestamptz not null,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles
  add constraint profiles_active_baby_id_fkey
  foreign key (active_baby_id) references public.babies(id) on delete set null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_babies_updated_at on public.babies;
create trigger set_babies_updated_at
before update on public.babies
for each row execute function public.set_updated_at();

drop trigger if exists set_caregivers_updated_at on public.caregivers;
create trigger set_caregivers_updated_at
before update on public.caregivers
for each row execute function public.set_updated_at();

create index if not exists babies_owner_id_idx on public.babies(owner_id);
create index if not exists caregivers_baby_id_idx on public.caregivers(baby_id);
create index if not exists caregivers_user_id_status_idx on public.caregivers(user_id, invite_status, baby_id);
create index if not exists profiles_active_baby_id_idx on public.profiles(active_baby_id);
create index if not exists deletion_jobs_profile_status_idx on public.deletion_jobs(profile_id, status, scheduled_for);

alter table public.profiles enable row level security;
alter table public.babies enable row level security;
alter table public.caregivers enable row level security;
alter table public.deletion_jobs enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "babies_select_authorized"
on public.babies
for select
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.caregivers c
    where c.baby_id = babies.id
      and c.user_id = auth.uid()
      and c.invite_status = 'accepted'
  )
);

create policy "babies_insert_owner_only"
on public.babies
for insert
with check (owner_id = auth.uid());

create policy "babies_update_owner_only"
on public.babies
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "babies_delete_owner_only"
on public.babies
for delete
using (owner_id = auth.uid());

create policy "caregivers_select_authorized"
on public.caregivers
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.babies b
    where b.id = caregivers.baby_id
      and b.owner_id = auth.uid()
  )
);

create policy "caregivers_insert_owner_only"
on public.caregivers
for insert
with check (
  exists (
    select 1
    from public.babies b
    where b.id = caregivers.baby_id
      and b.owner_id = auth.uid()
  )
);

create policy "caregivers_update_owner_only"
on public.caregivers
for update
using (
  exists (
    select 1
    from public.babies b
    where b.id = caregivers.baby_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.babies b
    where b.id = caregivers.baby_id
      and b.owner_id = auth.uid()
  )
);

create policy "caregivers_delete_owner_only"
on public.caregivers
for delete
using (
  exists (
    select 1
    from public.babies b
    where b.id = caregivers.baby_id
      and b.owner_id = auth.uid()
  )
);

create policy "deletion_jobs_select_own"
on public.deletion_jobs
for select
using (profile_id = auth.uid());

create policy "deletion_jobs_insert_own"
on public.deletion_jobs
for insert
with check (profile_id = auth.uid());
