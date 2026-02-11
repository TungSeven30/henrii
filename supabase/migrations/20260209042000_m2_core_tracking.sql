create table if not exists public.feedings (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  logged_by uuid not null references auth.users(id) on delete cascade,
  client_uuid uuid not null default gen_random_uuid(),
  feeding_type text not null default 'bottle' check (feeding_type in ('breast', 'bottle', 'solid')),
  amount_ml integer check (amount_ml is null or amount_ml >= 0),
  started_at timestamptz not null default timezone('utc', now()),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (baby_id, client_uuid)
);

create table if not exists public.sleep_sessions (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  logged_by uuid not null references auth.users(id) on delete cascade,
  client_uuid uuid not null default gen_random_uuid(),
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (baby_id, client_uuid)
);

create table if not exists public.diaper_changes (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  logged_by uuid not null references auth.users(id) on delete cascade,
  client_uuid uuid not null default gen_random_uuid(),
  change_type text not null default 'wet' check (change_type in ('wet', 'dirty', 'mixed')),
  changed_at timestamptz not null default timezone('utc', now()),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (baby_id, client_uuid)
);

drop trigger if exists set_feedings_updated_at on public.feedings;
create trigger set_feedings_updated_at
before update on public.feedings
for each row execute function public.set_updated_at();

drop trigger if exists set_sleep_sessions_updated_at on public.sleep_sessions;
create trigger set_sleep_sessions_updated_at
before update on public.sleep_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_diaper_changes_updated_at on public.diaper_changes;
create trigger set_diaper_changes_updated_at
before update on public.diaper_changes
for each row execute function public.set_updated_at();

create index if not exists feedings_baby_started_at_idx on public.feedings(baby_id, started_at desc);
create index if not exists sleep_sessions_baby_started_at_idx on public.sleep_sessions(baby_id, started_at desc);
create index if not exists diaper_changes_baby_changed_at_idx on public.diaper_changes(baby_id, changed_at desc);

alter table public.feedings enable row level security;
alter table public.sleep_sessions enable row level security;
alter table public.diaper_changes enable row level security;

create policy "feedings_select_authorized"
on public.feedings
for select
using (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
);

create policy "feedings_insert_authorized"
on public.feedings
for insert
with check (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
  and logged_by = auth.uid()
);

create policy "feedings_update_authorized"
on public.feedings
for update
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
)
with check (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

create policy "feedings_delete_authorized"
on public.feedings
for delete
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

create policy "sleep_select_authorized"
on public.sleep_sessions
for select
using (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
);

create policy "sleep_insert_authorized"
on public.sleep_sessions
for insert
with check (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
  and logged_by = auth.uid()
);

create policy "sleep_update_authorized"
on public.sleep_sessions
for update
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
)
with check (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

create policy "sleep_delete_authorized"
on public.sleep_sessions
for delete
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

create policy "diaper_select_authorized"
on public.diaper_changes
for select
using (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
);

create policy "diaper_insert_authorized"
on public.diaper_changes
for insert
with check (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
  and logged_by = auth.uid()
);

create policy "diaper_update_authorized"
on public.diaper_changes
for update
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
)
with check (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

create policy "diaper_delete_authorized"
on public.diaper_changes
for delete
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);
