create table if not exists public.event_conflicts (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  event_table text not null check (event_table in ('feedings', 'sleep_sessions', 'diaper_changes')),
  event_1_id uuid not null,
  event_2_id uuid not null,
  event_1_logged_by uuid not null references auth.users(id) on delete cascade,
  event_2_logged_by uuid not null references auth.users(id) on delete cascade,
  event_1_happened_at timestamptz not null,
  event_2_happened_at timestamptz not null,
  event_1_snapshot jsonb not null,
  event_2_snapshot jsonb not null,
  detected_reason text not null default 'same_type_within_5m_different_users',
  status text not null default 'open' check (status in ('open', 'resolved_keep_both', 'dismissed')),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint event_conflicts_distinct_pair check (event_1_id <> event_2_id),
  unique (event_table, event_1_id, event_2_id)
);

create index if not exists event_conflicts_baby_status_idx
on public.event_conflicts (baby_id, status, created_at desc);

alter table public.event_conflicts enable row level security;

create policy "event_conflicts_select_authorized"
on public.event_conflicts
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

create policy "event_conflicts_update_authorized"
on public.event_conflicts
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

create or replace function public.insert_event_conflict(
  p_event_table text,
  p_baby_id uuid,
  p_event_a_id uuid,
  p_event_b_id uuid,
  p_event_a_logged_by uuid,
  p_event_b_logged_by uuid,
  p_event_a_happened_at timestamptz,
  p_event_b_happened_at timestamptz,
  p_event_a_snapshot jsonb,
  p_event_b_snapshot jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_1_id uuid;
  v_event_2_id uuid;
  v_event_1_logged_by uuid;
  v_event_2_logged_by uuid;
  v_event_1_happened_at timestamptz;
  v_event_2_happened_at timestamptz;
  v_event_1_snapshot jsonb;
  v_event_2_snapshot jsonb;
begin
  if p_event_a_id::text <= p_event_b_id::text then
    v_event_1_id := p_event_a_id;
    v_event_2_id := p_event_b_id;
    v_event_1_logged_by := p_event_a_logged_by;
    v_event_2_logged_by := p_event_b_logged_by;
    v_event_1_happened_at := p_event_a_happened_at;
    v_event_2_happened_at := p_event_b_happened_at;
    v_event_1_snapshot := p_event_a_snapshot;
    v_event_2_snapshot := p_event_b_snapshot;
  else
    v_event_1_id := p_event_b_id;
    v_event_2_id := p_event_a_id;
    v_event_1_logged_by := p_event_b_logged_by;
    v_event_2_logged_by := p_event_a_logged_by;
    v_event_1_happened_at := p_event_b_happened_at;
    v_event_2_happened_at := p_event_a_happened_at;
    v_event_1_snapshot := p_event_b_snapshot;
    v_event_2_snapshot := p_event_a_snapshot;
  end if;

  insert into public.event_conflicts (
    baby_id,
    event_table,
    event_1_id,
    event_2_id,
    event_1_logged_by,
    event_2_logged_by,
    event_1_happened_at,
    event_2_happened_at,
    event_1_snapshot,
    event_2_snapshot
  ) values (
    p_baby_id,
    p_event_table,
    v_event_1_id,
    v_event_2_id,
    v_event_1_logged_by,
    v_event_2_logged_by,
    v_event_1_happened_at,
    v_event_2_happened_at,
    v_event_1_snapshot,
    v_event_2_snapshot
  )
  on conflict (event_table, event_1_id, event_2_id) do nothing;
end;
$$;

create or replace function public.detect_feeding_conflicts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate record;
begin
  for candidate in
    select *
    from public.feedings
    where baby_id = new.baby_id
      and id <> new.id
      and logged_by <> new.logged_by
      and started_at between new.started_at - interval '5 minutes' and new.started_at + interval '5 minutes'
  loop
    perform public.insert_event_conflict(
      'feedings',
      new.baby_id,
      candidate.id,
      new.id,
      candidate.logged_by,
      new.logged_by,
      candidate.started_at,
      new.started_at,
      to_jsonb(candidate),
      to_jsonb(new)
    );
  end loop;

  return new;
end;
$$;

create or replace function public.detect_sleep_conflicts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate record;
begin
  for candidate in
    select *
    from public.sleep_sessions
    where baby_id = new.baby_id
      and id <> new.id
      and logged_by <> new.logged_by
      and started_at between new.started_at - interval '5 minutes' and new.started_at + interval '5 minutes'
  loop
    perform public.insert_event_conflict(
      'sleep_sessions',
      new.baby_id,
      candidate.id,
      new.id,
      candidate.logged_by,
      new.logged_by,
      candidate.started_at,
      new.started_at,
      to_jsonb(candidate),
      to_jsonb(new)
    );
  end loop;

  return new;
end;
$$;

create or replace function public.detect_diaper_conflicts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate record;
begin
  for candidate in
    select *
    from public.diaper_changes
    where baby_id = new.baby_id
      and id <> new.id
      and logged_by <> new.logged_by
      and changed_at between new.changed_at - interval '5 minutes' and new.changed_at + interval '5 minutes'
  loop
    perform public.insert_event_conflict(
      'diaper_changes',
      new.baby_id,
      candidate.id,
      new.id,
      candidate.logged_by,
      new.logged_by,
      candidate.changed_at,
      new.changed_at,
      to_jsonb(candidate),
      to_jsonb(new)
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists detect_feeding_conflicts_trigger on public.feedings;
create trigger detect_feeding_conflicts_trigger
after insert on public.feedings
for each row execute function public.detect_feeding_conflicts();

drop trigger if exists detect_sleep_conflicts_trigger on public.sleep_sessions;
create trigger detect_sleep_conflicts_trigger
after insert on public.sleep_sessions
for each row execute function public.detect_sleep_conflicts();

drop trigger if exists detect_diaper_conflicts_trigger on public.diaper_changes;
create trigger detect_diaper_conflicts_trigger
after insert on public.diaper_changes
for each row execute function public.detect_diaper_conflicts();
