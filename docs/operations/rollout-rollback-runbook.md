# Rollout and Rollback Runbook

## Scope
- App deploys (Next.js on Vercel)
- Supabase schema migrations
- Stripe webhook and notification cron routes

## Rollout Checklist
1. Verify CI is green on target commit.
2. Apply migrations in staging and run smoke checks:
   - auth login/logout
   - quick log online/offline
   - invite flow
   - growth + milestones
   - analytics/paywall
   - export endpoints
3. Verify staging webhooks and cron endpoints:
   - `/api/webhooks/stripe`
   - `/api/cron/reminders` (delegates to `/api/notifications/send`)
4. Promote to production.
5. Watch metrics for 30 minutes:
   - auth failures
   - sync errors
   - export 5xx
   - webhook 4xx/5xx

## Rollback Triggers
- Error rate > 2x baseline for 10 min
- Auth or event logging outage
- Sync queue failure spike (>2%)
- Stripe webhook failures > 5%

## Rollback Steps
1. Re-deploy previous healthy app build in Vercel.
2. Disable cron traffic to failing endpoints if needed.
3. If migration caused breakage:
   - ship hotfix migration instead of destructive rollback
   - avoid dropping columns/tables in emergency rollback path
4. Re-run smoke checks on rolled-back build.

## Incident Notes
- Open incident doc with:
  - timeline
  - impact
  - root cause
  - remediation
  - follow-up tasks and owners
