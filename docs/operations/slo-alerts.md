# SLO and Alert Baseline

## SLOs
- Core event logging API p95: `< 400ms`
- Offline replay success rate: `>= 99.5%`
- Reminder email delivery success: `>= 99%`
- PDF export success: `>= 99%` (excluding 429)
- Crash-free sessions: `>= 99.8%`

## Alert Thresholds
- Sync backlog age > 10 minutes
- `/api/events/log` 5xx > 1% for 15 minutes
- `/api/export/pdf` 5xx > 3% for 15 minutes
- Stripe webhook 4xx/5xx > 5% for 15 minutes
- Reminder send failures > 2% for 15 minutes

## Dashboards
- API latency/error dashboard by route
- Offline queue status dashboard
- Notification send dashboard
- Billing webhook dashboard
- Export volume/failure dashboard

## Ownership
- Auth + Core tracking: Full-stack lead
- Offline/sync + conflicts: Backend lead
- Billing/webhooks: Product engineer
- Notifications/export: Full-stack lead
