create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  event_type text not null check (event_type in ('appointment', 'vaccination', 'feeding_gap', 'diaper_gap', 'milestone')),
  email_enabled boolean not null default true,
  push_enabled boolean not null default false,
  threshold_minutes integer check (threshold_minutes is null or threshold_minutes >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, baby_id, event_type)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baby_id uuid not null references public.babies(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  enabled boolean not null default true,
  last_sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, baby_id, endpoint)
);

create table if not exists public.api_rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null,
  window_start timestamptz not null,
  count integer not null default 0 check (count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, scope, window_start)
);

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'en',
  source text not null default 'landing',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists subscriptions_plan_status_idx
on public.subscriptions(plan, status);

create index if not exists notification_preferences_user_baby_idx
on public.notification_preferences(user_id, baby_id, event_type);

create index if not exists push_subscriptions_user_enabled_idx
on public.push_subscriptions(user_id, baby_id, enabled);

create index if not exists api_rate_limits_scope_window_idx
on public.api_rate_limits(scope, window_start desc);

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_notification_preferences_updated_at on public.notification_preferences;
create trigger set_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

drop trigger if exists set_push_subscriptions_updated_at on public.push_subscriptions;
create trigger set_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_api_rate_limits_updated_at on public.api_rate_limits;
create trigger set_api_rate_limits_updated_at
before update on public.api_rate_limits
for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.api_rate_limits enable row level security;
alter table public.waitlist_signups enable row level security;

create policy "subscriptions_select_own"
on public.subscriptions
for select
using (user_id = auth.uid());

create policy "subscriptions_insert_own"
on public.subscriptions
for insert
with check (user_id = auth.uid());

create policy "subscriptions_update_own"
on public.subscriptions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "notification_preferences_select_authorized"
on public.notification_preferences
for select
using (
  user_id = auth.uid()
  and baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
);

create policy "notification_preferences_insert_authorized"
on public.notification_preferences
for insert
with check (
  user_id = auth.uid()
  and baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
);

create policy "notification_preferences_update_authorized"
on public.notification_preferences
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "push_subscriptions_select_authorized"
on public.push_subscriptions
for select
using (
  user_id = auth.uid()
  and baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
);

create policy "push_subscriptions_insert_authorized"
on public.push_subscriptions
for insert
with check (
  user_id = auth.uid()
  and baby_id in (
    select id from public.babies where owner_id = auth.uid()
    union
    select baby_id from public.caregivers where user_id = auth.uid() and invite_status = 'accepted'
  )
);

create policy "push_subscriptions_update_authorized"
on public.push_subscriptions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "push_subscriptions_delete_authorized"
on public.push_subscriptions
for delete
using (user_id = auth.uid());

create policy "api_rate_limits_select_own"
on public.api_rate_limits
for select
using (user_id = auth.uid());

create policy "api_rate_limits_insert_own"
on public.api_rate_limits
for insert
with check (user_id = auth.uid());

create policy "api_rate_limits_update_own"
on public.api_rate_limits
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "waitlist_public_insert"
on public.waitlist_signups
for insert
with check (true);

create policy "waitlist_select_own"
on public.waitlist_signups
for select
using (auth.role() = 'authenticated');
