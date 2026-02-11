create table if not exists public.mutation_conflicts (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  event_table text not null check (event_table in ('feedings', 'sleep_sessions', 'diaper_changes')),
  event_id uuid not null,
  operation text not null check (operation in ('update', 'delete')),
  reported_by uuid not null references auth.users(id) on delete cascade,
  expected_updated_at timestamptz,
  actual_updated_at timestamptz not null,
  attempted_patch jsonb,
  current_snapshot jsonb not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists mutation_conflicts_baby_status_idx
on public.mutation_conflicts (baby_id, status, created_at desc);

create index if not exists mutation_conflicts_event_idx
on public.mutation_conflicts (event_table, event_id, created_at desc);

alter table public.mutation_conflicts enable row level security;

create policy "mutation_conflicts_select_authorized"
on public.mutation_conflicts
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

create policy "mutation_conflicts_insert_authorized"
on public.mutation_conflicts
for insert
with check (
  reported_by = auth.uid()
  and baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
);

create policy "mutation_conflicts_update_authorized"
on public.mutation_conflicts
for update
using (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
)
with check (
  baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id
    from public.caregivers
    where user_id = auth.uid()
      and invite_status = 'accepted'
  )
  and resolved_by = auth.uid()
);
