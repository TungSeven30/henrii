create table if not exists public.growth_measurements (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  logged_by uuid not null references auth.users(id) on delete cascade,
  client_uuid uuid not null default gen_random_uuid(),
  measured_at date not null,
  weight_kg numeric(6, 3),
  length_cm numeric(6, 2),
  head_circumference_cm numeric(6, 2),
  weight_percentile numeric(5, 2),
  length_percentile numeric(5, 2),
  head_percentile numeric(5, 2),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint growth_measurements_has_value check (
    weight_kg is not null
    or length_cm is not null
    or head_circumference_cm is not null
  ),
  unique (baby_id, client_uuid)
);

create table if not exists public.milestone_definitions (
  key text primary key,
  category text not null check (category in ('motor', 'language', 'social', 'cognitive')),
  name_en text not null,
  name_vi text not null,
  description_en text not null,
  description_vi text not null,
  typical_age_min_months integer not null check (typical_age_min_months >= 0),
  typical_age_max_months integer not null check (typical_age_max_months >= typical_age_min_months),
  source text not null default 'WHO/CDC',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.developmental_milestones (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  milestone_key text not null references public.milestone_definitions(key) on delete cascade,
  logged_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'emerging', 'achieved')),
  achieved_at date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (baby_id, milestone_key)
);

drop trigger if exists set_growth_measurements_updated_at on public.growth_measurements;
create trigger set_growth_measurements_updated_at
before update on public.growth_measurements
for each row execute function public.set_updated_at();

drop trigger if exists set_developmental_milestones_updated_at on public.developmental_milestones;
create trigger set_developmental_milestones_updated_at
before update on public.developmental_milestones
for each row execute function public.set_updated_at();

create index if not exists growth_measurements_baby_measured_idx
on public.growth_measurements (baby_id, measured_at desc);

create index if not exists developmental_milestones_baby_status_idx
on public.developmental_milestones (baby_id, status, updated_at desc);

alter table public.growth_measurements enable row level security;
alter table public.milestone_definitions enable row level security;
alter table public.developmental_milestones enable row level security;

create policy "growth_measurements_select_authorized"
on public.growth_measurements
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

create policy "growth_measurements_insert_authorized"
on public.growth_measurements
for insert
with check (
  logged_by = auth.uid()
  and baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
);

create policy "growth_measurements_update_authorized"
on public.growth_measurements
for update
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
)
with check (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

create policy "growth_measurements_delete_authorized"
on public.growth_measurements
for delete
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

create policy "milestone_definitions_read_authenticated"
on public.milestone_definitions
for select
using (auth.role() = 'authenticated');

create policy "milestone_definitions_write_authenticated"
on public.milestone_definitions
for insert
with check (auth.role() = 'authenticated');

create policy "milestone_definitions_update_authenticated"
on public.milestone_definitions
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "developmental_milestones_select_authorized"
on public.developmental_milestones
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

create policy "developmental_milestones_insert_authorized"
on public.developmental_milestones
for insert
with check (
  logged_by = auth.uid()
  and baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
);

create policy "developmental_milestones_update_authorized"
on public.developmental_milestones
for update
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
)
with check (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

create policy "developmental_milestones_delete_authorized"
on public.developmental_milestones
for delete
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);
