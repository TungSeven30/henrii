alter table public.appointments
add column if not exists reminder_sent_at timestamptz;

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  channel text not null check (channel in ('email', 'push')),
  status text not null check (status in ('sent', 'failed', 'skipped')),
  error_message text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists notification_logs_appointment_idx
on public.notification_logs(appointment_id, created_at desc);
