create table if not exists public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  logged_by uuid not null references auth.users(id) on delete cascade,
  client_uuid uuid not null default gen_random_uuid(),
  vaccine_code text not null,
  vaccine_name text not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'skipped')),
  completed_at date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (baby_id, client_uuid),
  unique (baby_id, vaccine_code, due_date)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  client_uuid uuid not null default gen_random_uuid(),
  title text not null,
  scheduled_at timestamptz not null,
  location text,
  notes text,
  reminder_hours_before integer not null default 24,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (baby_id, client_uuid)
);

drop trigger if exists set_vaccinations_updated_at on public.vaccinations;
create trigger set_vaccinations_updated_at
before update on public.vaccinations
for each row execute function public.set_updated_at();

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

create index if not exists vaccinations_baby_due_date_idx on public.vaccinations(baby_id, due_date asc);
create index if not exists appointments_baby_scheduled_idx on public.appointments(baby_id, scheduled_at asc);

alter table public.vaccinations enable row level security;
alter table public.appointments enable row level security;

create policy "vaccinations_select_authorized"
on public.vaccinations
for select
using (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
);

create policy "vaccinations_insert_authorized"
on public.vaccinations
for insert
with check (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
  and logged_by = auth.uid()
);

create policy "vaccinations_update_authorized"
on public.vaccinations
for update
using (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
)
with check (
  logged_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);

create policy "appointments_select_authorized"
on public.appointments
for select
using (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
);

create policy "appointments_insert_authorized"
on public.appointments
for insert
with check (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
  and created_by = auth.uid()
);

create policy "appointments_update_authorized"
on public.appointments
for update
using (
  created_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
)
with check (
  created_by = auth.uid()
  or baby_id in (select id from public.babies where owner_id = auth.uid())
);
