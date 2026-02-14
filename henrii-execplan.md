# henrii — Baby Tracking PWA

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.


## Purpose / Big Picture

henrii is a Progressive Web App for tracking a baby's daily life — feedings, sleep, diapers, vaccinations, growth, doctor appointments, and developmental milestones. It is designed for sleep-deprived parents who need to log events one-handed at 3am, share access with caregivers, and walk into a pediatrician's office with a polished PDF summary.

After this work is complete, a parent can install henrii on their phone, create an account, add their baby's profile, and immediately begin logging daily events. A caregiver (grandparent, nanny) can be invited with limited permissions. The app works offline, syncs when connectivity returns, and provides a full analytics dashboard with growth percentile charts and pattern detection. The scheduled dark mode activates automatically at night. Vietnamese and English are both supported from launch.

The name "henrii" is inspired by the developer's newborn son, Henry.


## Progress

Status snapshot date: 2026-02-14 (branch: `security-merge`, head: `87d5b98`)

- [x] Project scaffolding (Next.js App Router, Supabase, Tailwind, shadcn/ui)
- [ ] Authentication system (Google + email magic link complete; Apple OAuth pending)
- [x] Database schema design and migration
- [x] i18n setup (next-intl, English + Vietnamese)
- [x] PWA configuration (service worker, manifest, offline support)
- [x] Baby profile CRUD
- [x] Core tracking trio: feeding, sleep, diaper
- [x] FAB radial menu for quick-logging
- [x] Dashboard home + timeline view
- [x] Vaccination tracker with preset schedules
- [x] Doctor appointment system
- [x] WHO growth charts with percentile curves
- [x] Developmental milestones tracker
- [x] Caregiver invite system with roles
- [x] Offline sync engine with conflict resolution
- [x] Notification system (email reminders + preferences + push delivery backend)
- [x] Scheduled dark mode
- [x] Analytics dashboard with trends and pattern detection
- [x] PDF export for pediatrician visits
- [x] Freemium paywall gating
- [x] Landing page with waitlist
- [ ] Testing (Vitest/unit+API coverage complete; Playwright E2E coverage pending)
- [x] Vercel deployment + CI/CD (GitHub Actions + Vercel workflow present; production env parity still needs operational checks)


## Surprises & Discoveries

- 2026-02-10: A dashboard React #185 loop was traced to unstable selector behavior in sync status rendering. Fixing derived-state reads resolved the loop.
- 2026-02-10: Production feed/photo logging failures were caused by missing `NEXT_PUBLIC_SUPABASE_URL` in deployed client env config, not by database logic.
- 2026-02-11 to 2026-02-13: Security hardening uncovered multiple upload and endpoint risks; fixes shipped for filename sanitization, MIME+magic-byte validation, invite response hygiene, rate limiting, and cron/debug endpoint lock-down.
- 2026-02-14: `tsc --noEmit` can fail from stale `.next/types` references after route removal; rebuilding regenerates validator types and clears the false failure.


## Decision Log

- Decision: Keep Apple OAuth out of launch-critical path.
  Rationale: Google OAuth + email magic link already cover sign-in reliability for MVP. Apple sign-in remains important, but is deferred to avoid blocking release stabilization.
  Date: 2026-02-14

- Decision: Treat push notifications as progressive enhancement until sender infrastructure is wired.
  Rationale: Preference management and subscription capture are implemented, but delivery backend is intentionally fail-safe with logs so reminder emails remain the guaranteed channel.
  Date: 2026-02-14

- Decision: Fail closed for scheduled reminder routes.
  Rationale: `/api/cron/reminders` and delegated notification sends now require `CRON_SECRET`; missing or mismatched secrets return unauthorized/config errors instead of running.
  Date: 2026-02-11

- Decision: Layered validation for file uploads (name sanitization + MIME + magic-byte checks + rate limit).
  Rationale: Single checks were insufficient against abuse and spoofed files. Defense-in-depth now protects photo upload and attachment-related paths.
  Date: 2026-02-11

- Decision: PWA-first, eventual native iOS.
  Rationale: Fastest path to a working product on all devices. When iOS is needed, the Supabase backend remains unchanged; only the client layer changes (Capacitor wrapper or native Swift app).
  Date: 2025-02-08

- Decision: Next.js App Router + Supabase over Firebase.
  Rationale: Supabase's PostgreSQL handles time-series queries for growth percentile calculations and pattern detection far better than Firestore. Row-Level Security maps directly to the admin/caregiver role model. Real-time subscriptions give instant cross-caregiver sync.
  Date: 2025-02-08

- Decision: Tailwind + shadcn/ui for component library.
  Rationale: shadcn provides unstyled primitives that are trivially skinnable with pastel theme tokens. Dark mode is a CSS variable swap. Accessible by default. No vendor lock-in — components are copied into the repo.
  Date: 2025-02-08

- Decision: Zustand for client-side state management.
  Rationale: Multiple independent timers (sleep, feeding), offline event queue, and UI state need lightweight, decoupled stores. Zustand's slice pattern handles this cleanly without Redux boilerplate. Good DevTools support.
  Date: 2025-02-08

- Decision: Timestamp-based merge for offline conflict resolution.
  Rationale: Each logged event gets a UUID and client-side timestamp at creation time. When syncing, non-conflicting entries merge automatically. If two caregivers log the same event type within a 5-minute window, the earlier timestamp wins and the duplicate is flagged for review. CRDTs are overkill for this domain. Last-write-wins risks data loss.
  Date: 2025-02-08

- Decision: Freemium monetization model.
  Rationale: Core tracking (feeding, sleep, diaper) is free to maximize adoption. Analytics dashboard, PDF export, and multi-caregiver invites are gated behind a paid tier. Parents try it for free during the chaotic newborn phase and upgrade once they're dependent on the data.
  Date: 2025-02-08

- Decision: Generic developmental milestones over Wonder Weeks.
  Rationale: Wonder Weeks content is copyrighted. WHO and CDC publish free developmental milestone data that is more medically rigorous. We build a custom "developmental leaps" timeline based on publicly available pediatric research. Zero legal risk, equivalent value.
  Date: 2025-02-08

- Decision: Basic feeding tracking (breast/bottle/solid, time, amount) for v1.
  Rationale: Left/right breast tracking, formula brand logging, and allergen tracking are v2 features. The core value is knowing when and how much baby ate, not which breast. Keeps the logging UX fast.
  Date: 2025-02-08

- Decision: Single baby UI for v1, but baby_id foreign key on every database table from day one.
  Rationale: The UI only shows one baby, but the data model supports multiple babies. This is a single column per table that prevents a catastrophic migration when twins/siblings support ships in v2.
  Date: 2025-02-08

- Decision: English + Vietnamese for launch, i18n architecture via next-intl.
  Rationale: Developer's personal need. next-intl is the most App Router-native i18n solution for Next.js, with built-in support for server components, middleware-based locale detection, and type-safe message keys.
  Date: 2025-02-08

- Decision: Rich notes with photos deferred to v2.
  Rationale: Photo storage, image optimization, and gallery UI are significant scope. MVP already includes Supabase Storage for doctor appointment attachments, so the infrastructure will exist — the rich notes feature just needs its own UI built on top.
  Date: 2025-02-08

- Decision: Scheduled dark mode (default: light 7am–7pm, dark 7pm–7am, user-configurable).
  Rationale: Parents use this app overwhelmingly at night. Following OS preference doesn't account for partners with different system settings. A baby-aware schedule that auto-dims at "bedtime" is more useful than a toggle.
  Date: 2025-02-08


## Outcomes & Retrospective

Current status (2026-02-14): Product scope is largely delivered through Milestones 1-8, with a short list of launch blockers and stabilization work remaining.

Validation snapshot:
- `npm run test:run`: pass (85 passed, 5 skipped integration tests)
- `npm run lint`: pass
- `npm run build`: pass
- `npm run typecheck`: pass after regeneration of `.next/types`

Milestone-level status:
- M1 Foundation: completed
- M2 Core Tracking Trio: completed
- M3 Dashboard & Timeline: completed
- M4 Vaccination & Appointments: completed
- M5 Growth Charts & Milestones: completed
- M6 Offline Sync & Caregivers: completed
- M7 Analytics, PDF & Notifications: completed
- M8 Freemium, Landing Page & Polish: mostly completed (Playwright E2E and production hardening remain)

Outstanding work to close release:
- Add Apple OAuth provider wiring and end-to-end sign-in validation.
- Add Playwright E2E smoke coverage for core flows (log feed, timer, photo upload, offline replay, invite acceptance).
- Run final production configuration verification (all public/server env vars, cron auth, and webhook secrets).


## Context and Orientation

This is a greenfield project. There is no existing codebase.

**Key terms used throughout this document:**

- **FAB**: Floating Action Button — a circular button fixed to the bottom-right of the viewport that expands into a radial menu of quick-log options (feed, sleep, diaper, etc.).
- **RLS**: Row-Level Security — a PostgreSQL feature (used by Supabase) that enforces access control at the database row level. Each query is filtered by the authenticated user's permissions automatically.
- **WHO growth charts**: Standardized percentile curves published by the World Health Organization for weight-for-age, length-for-age, head circumference-for-age, and BMI-for-age for children 0–5 years. The raw data tables are freely available as CSV/Excel files.
- **Developmental milestones**: Age-specific skills and behaviors (rolling over, first words, crawling) published by WHO and CDC. Not to be confused with "Wonder Weeks," which is copyrighted.
- **PWA**: Progressive Web App — a web application that can be installed on a device's home screen, works offline via service workers, and can send push notifications.
- **Preset vaccination schedules**: Country-specific immunization timetables (e.g., CDC schedule for the US, NHS schedule for the UK, Vietnam's National Expanded Programme on Immunization). Stored as structured JSON data keyed by country code.


## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Server components, API routes, PWA-friendly, Vercel-native |
| Database | Supabase (PostgreSQL) | RLS for roles, real-time subscriptions, time-series queries |
| Auth | Supabase Auth (Google, Apple, email) | Integrated with RLS, supports OAuth providers |
| File Storage | Supabase Storage | S3-compatible, RLS-integrated, used for appointment attachments |
| Client State | Zustand | Lightweight stores for timers, offline queue, UI state |
| Styling | Tailwind CSS + shadcn/ui | Unstyled primitives, CSS variable theming for pastels + dark mode |
| i18n | next-intl | App Router native, server component support, type-safe |
| Email | Resend | Caregiver invites, vaccination reminders, appointment alerts |
| Deployment | Vercel | Zero-config Next.js hosting, edge functions, preview deploys |
| Testing | Vitest + React Testing Library + Playwright | Unit/integration + E2E coverage |
| Push Notifications | Web Push API | Browser-based, works on Android, limited iOS Safari support |


## Database Schema

All tables include a `baby_id` foreign key to support multi-baby in v2, even though the v1 UI is single-baby.

**Core tables:**

    profiles
      id: uuid (PK, references auth.users)
      display_name: text
      avatar_url: text
      locale: text (default 'en')
      dark_mode_schedule: jsonb (default {"start": "19:00", "end": "07:00"})
      created_at: timestamptz

    babies
      id: uuid (PK)
      owner_id: uuid (FK → profiles.id)
      name: text
      date_of_birth: date
      gender: text (nullable)
      birth_weight_grams: integer (nullable)
      birth_length_cm: numeric (nullable)
      country_code: text (for vaccination schedule)
      photo_url: text (nullable)
      created_at: timestamptz

    caregivers
      id: uuid (PK)
      baby_id: uuid (FK → babies.id)
      user_id: uuid (FK → profiles.id)
      role: text ('admin' | 'caregiver')
      invited_by: uuid (FK → profiles.id)
      invite_status: text ('pending' | 'accepted' | 'revoked')
      invited_at: timestamptz
      accepted_at: timestamptz (nullable)

    feedings
      id: uuid (PK)
      baby_id: uuid (FK → babies.id)
      logged_by: uuid (FK → profiles.id)
      type: text ('breast' | 'bottle' | 'solid')
      amount_ml: numeric (nullable, for bottle)
      amount_description: text (nullable, for solids — e.g., "half a jar")
      started_at: timestamptz
      ended_at: timestamptz (nullable)
      duration_minutes: integer (nullable)
      notes: text (nullable)
      client_uuid: uuid (for offline dedup)
      created_at: timestamptz

    sleep_sessions
      id: uuid (PK)
      baby_id: uuid (FK → babies.id)
      logged_by: uuid (FK → profiles.id)
      started_at: timestamptz
      ended_at: timestamptz (nullable — null means timer is running)
      duration_minutes: integer (nullable, computed on end)
      quality: text (nullable — 'good' | 'restless' | 'interrupted')
      notes: text (nullable)
      client_uuid: uuid
      created_at: timestamptz

    diaper_changes
      id: uuid (PK)
      baby_id: uuid (FK → babies.id)
      logged_by: uuid (FK → profiles.id)
      changed_at: timestamptz
      type: text ('wet' | 'dirty' | 'both' | 'dry')
      color: text (nullable — 'yellow' | 'green' | 'brown' | 'black' | 'red' | 'white')
      consistency: text (nullable — 'liquid' | 'soft' | 'formed' | 'hard')
      notes: text (nullable)
      client_uuid: uuid
      created_at: timestamptz

    vaccinations
      id: uuid (PK)
      baby_id: uuid (FK → babies.id)
      vaccine_name: text
      dose_number: integer
      scheduled_date: date
      administered_date: date (nullable)
      status: text ('scheduled' | 'completed' | 'skipped' | 'delayed')
      administered_by: text (nullable — doctor/clinic name)
      lot_number: text (nullable)
      notes: text (nullable)
      source_schedule: text (nullable — 'CDC' | 'NHS' | 'VN' | 'custom')
      created_at: timestamptz

    appointments
      id: uuid (PK)
      baby_id: uuid (FK → babies.id)
      created_by: uuid (FK → profiles.id)
      title: text
      doctor_name: text (nullable)
      clinic_name: text (nullable)
      scheduled_at: timestamptz
      duration_minutes: integer (default 30)
      reason: text (nullable)
      post_visit_notes: text (nullable)
      reminder_sent: boolean (default false)
      created_at: timestamptz

    appointment_attachments
      id: uuid (PK)
      appointment_id: uuid (FK → appointments.id)
      file_url: text
      file_name: text
      file_type: text
      file_size_bytes: integer
      uploaded_by: uuid (FK → profiles.id)
      created_at: timestamptz

    growth_measurements
      id: uuid (PK)
      baby_id: uuid (FK → babies.id)
      logged_by: uuid (FK → profiles.id)
      measured_at: date
      weight_grams: numeric (nullable)
      length_cm: numeric (nullable)
      head_circumference_cm: numeric (nullable)
      weight_percentile: numeric (nullable — computed)
      length_percentile: numeric (nullable — computed)
      head_percentile: numeric (nullable — computed)
      bmi: numeric (nullable — computed)
      notes: text (nullable)
      created_at: timestamptz

    developmental_milestones
      id: uuid (PK)
      baby_id: uuid (FK → babies.id)
      milestone_key: text (references a static milestone definition)
      achieved_at: date (nullable)
      status: text ('not_started' | 'emerging' | 'achieved')
      notes: text (nullable)
      created_at: timestamptz

    milestone_definitions (static/seed data)
      key: text (PK — e.g., 'motor.roll_over', 'language.first_word')
      category: text ('motor' | 'language' | 'social' | 'cognitive')
      name_en: text
      name_vi: text
      description_en: text
      description_vi: text
      typical_age_months_min: integer
      typical_age_months_max: integer
      source: text ('WHO' | 'CDC')

    notification_preferences
      id: uuid (PK)
      user_id: uuid (FK → profiles.id)
      baby_id: uuid (FK → babies.id)
      event_type: text ('vaccination' | 'appointment' | 'feeding_gap' | 'diaper_gap' | 'milestone')
      push_enabled: boolean (default true)
      email_enabled: boolean (default false)
      threshold_minutes: integer (nullable — for gap alerts, e.g., 300 for "no feed in 5hrs")
      created_at: timestamptz

    offline_sync_queue (client-side only, IndexedDB via Zustand persist)
      id: uuid
      table_name: text
      operation: text ('insert' | 'update' | 'delete')
      payload: jsonb
      client_timestamp: timestamptz
      synced: boolean
      sync_attempted_at: timestamptz (nullable)
      error: text (nullable)

    subscriptions (for freemium gating)
      id: uuid (PK)
      user_id: uuid (FK → profiles.id)
      plan: text ('free' | 'premium')
      stripe_customer_id: text (nullable)
      stripe_subscription_id: text (nullable)
      current_period_start: timestamptz (nullable)
      current_period_end: timestamptz (nullable)
      status: text ('active' | 'canceled' | 'past_due')
      created_at: timestamptz


## Plan of Work

The work is organized into eight milestones that build on each other incrementally. Each milestone produces a deployable, testable increment.

**Milestone 1 — Foundation (scaffolding, auth, baby profile)**

Set up the Next.js project with App Router, Tailwind, shadcn/ui, and next-intl. Configure Supabase project with auth providers (Google, Apple, email). Create the database schema for `profiles`, `babies`, and `caregivers` tables with RLS policies. Build the onboarding flow: sign up → create baby profile → land on empty dashboard. Configure PWA manifest and basic service worker. Deploy to Vercel.

**Milestone 2 — Core Tracking Trio (feeding, sleep, diaper)**

Implement the three primary trackers. Build the FAB radial menu component that expands into feed/sleep/diaper quick-log options. Feeding: form with type selector (breast/bottle/solid), time picker, optional amount. Sleep: dual-mode input — start/stop timer with a running clock, OR after-the-fact time range picker. Diaper: type, color preset selector, consistency, timestamp. All three write to their respective tables with `client_uuid` for offline dedup.

**Milestone 3 — Dashboard & Timeline**

Build the dashboard home view with summary cards: "today" counts for each tracker, last event timestamps, active timer display. Build the timeline view as a reverse-chronological feed of all events across all trackers, filterable by type. Implement the view toggle between dashboard and timeline. Add the scheduled dark mode system (CSS variables swap on a client-side timer, configurable in settings).

**Milestone 4 — Vaccination & Appointments**

Implement the vaccination tracker. Seed the database with preset schedules for at least the US (CDC), UK (NHS), and Vietnam (NEPI). On baby profile creation, auto-populate the vaccination schedule based on country code and date of birth. Allow users to customize: skip, delay, add custom vaccines. Build the doctor appointment system: CRUD for appointments, file upload for attachments (Supabase Storage), post-visit notes field. Implement reminder notifications (push + email via Resend) for upcoming vaccinations and appointments.

**Milestone 5 — Growth Charts & Milestones**

Implement growth measurement logging (weight, length, head circumference). Integrate WHO growth standard data tables (available as CSV from who.int). Calculate percentiles by interpolating baby's measurements against age-and-sex-specific WHO reference data. Render interactive percentile curve charts (using a charting library like Recharts or Chart.js). Show alerts when a measurement crosses a percentile threshold. Build the developmental milestones tracker with seed data from WHO/CDC public milestone lists, categorized by motor/language/social/cognitive. Show age-appropriate milestones with status tracking.

**Milestone 6 — Offline Sync & Caregiver System**

Implement the offline sync engine. Use Zustand with persist middleware (IndexedDB) to queue events logged while offline. On reconnect, replay the queue against Supabase with timestamp-based conflict resolution: events within a 5-minute window of the same type are flagged as potential duplicates. Build the caregiver invite flow: admin enters email → Resend sends invite link → invitee signs up or logs in → accepts invite → gains read/write access scoped by RLS to the specific baby. Caregiver role has full logging permissions but cannot delete the baby profile, manage billing, or invite other caregivers.

**Milestone 7 — Analytics, PDF Export & Notifications**

Build the analytics dashboard: daily summaries, weekly trends, feeding/sleep/diaper frequency charts, averages and comparisons to previous weeks. Implement pattern detection: "no poop in 48 hours," "feeding intervals increasing," "sleep duration trending down." Generate PDF reports for a user-selected date range using a server-side PDF library (e.g., @react-pdf/renderer or puppeteer-based HTML-to-PDF). PDF includes: feeding log, sleep summary, diaper log, growth chart snapshot, vaccination status, milestone progress. Implement the full notification system: web push API registration, Resend email integration, per-event-type preferences UI.

**Milestone 8 — Freemium, Landing Page & Polish**

Implement Stripe integration for premium subscriptions. Gate analytics dashboard, PDF export, and caregiver invites behind the paywall. Free tier retains: core trio tracking, vaccination tracker, growth logging (without percentile charts), milestones, and single-user access. Build the marketing landing page with waitlist signup (can be a simple Next.js page at the root, or a separate route group). Final polish pass: loading states, error boundaries, empty states, onboarding tooltips, haptic feedback for FAB interactions, PWA install prompt.


## Concrete Steps

(To be populated with exact commands as each milestone begins. Below is the initial scaffolding.)

Working directory: the project root.

    npx create-next-app@latest henrii --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
    cd henrii
    npx shadcn@latest init
    npm install @supabase/supabase-js @supabase/ssr zustand next-intl resend
    npm install -D vitest @testing-library/react @testing-library/jest-dom playwright @playwright/test

Expected output: a running Next.js dev server at localhost:3000 with Tailwind configured and shadcn/ui initialized.

Supabase project setup:

    npx supabase init
    npx supabase start  # local development
    # Apply migrations via supabase/migrations/*.sql

(Detailed commands per milestone will be added as work proceeds.)


## Validation and Acceptance

**Milestone 1**: Navigate to localhost:3000 → see login page → sign in with Google → complete baby profile form → land on empty dashboard. Switching browser language to Vietnamese shows all UI text in Vietnamese.

**Milestone 2**: Tap FAB → radial menu expands → tap "Feed" → log a bottle feeding of 120ml → see it appear on dashboard. Start a sleep timer → see running clock → stop it → duration recorded. Log a diaper change → see it on dashboard.

**Milestone 3**: Dashboard shows "Today: 3 feeds, 2 naps, 4 diapers" with last-event timestamps. Toggle to timeline → see all events in reverse-chron. At 7pm (or configured time), the UI automatically switches to dark mode pastels.

**Milestone 4**: On baby profile with country=US, see CDC vaccination schedule pre-populated with dates calculated from DOB. Mark a vaccine as "completed" → status updates. Create an appointment for next Tuesday → receive email reminder 24hr before.

**Milestone 5**: Log weight measurement → see a dot plotted on the WHO weight-for-age percentile chart → hover shows "45th percentile." Milestones page shows age-appropriate items like "Rolls over" with status toggles.

**Milestone 6**: Turn off wifi → log a feeding → see it saved locally with a "pending sync" badge → turn wifi back on → entry syncs to Supabase and badge disappears. Invite a caregiver by email → they receive an email → they sign up → they can see and log events for the baby.

**Milestone 7**: Analytics page shows weekly feeding frequency chart, average sleep duration trend, diaper pattern alerts. Export PDF for "last 30 days" → receive a formatted PDF with all tracked data. Notification preferences page allows toggling push/email per event type.

**Milestone 8**: Non-paying user sees analytics page with a "Upgrade to Premium" overlay. Stripe checkout flow completes → analytics unlocks. Landing page at /marketing shows app description with waitlist email capture.


## Idempotence and Recovery

All database operations use UUIDs generated client-side, making inserts idempotent — re-syncing the same event with the same `client_uuid` will not create duplicates (enforced by a unique constraint on `client_uuid` per table).

Supabase migrations are idempotent by convention (use `CREATE TABLE IF NOT EXISTS`, `DO $$ ... $$` blocks for conditional alterations).

The offline sync queue in IndexedDB can be cleared by the user via a "Force Sync" button in settings, which replays all unsynced events and clears the queue.

Vercel deployments are atomic — a failed deploy does not affect the running production build.


## Interfaces and Dependencies

**Supabase RLS Policies (critical for security):**

Every data table must have RLS policies that enforce: a user can only read/write rows where they are either the baby's owner (admin) or an accepted caregiver for that baby. The `caregivers` table acts as the join table for authorization.

    -- Example RLS policy for feedings table:
    CREATE POLICY "Users can read feedings for their babies" ON feedings
      FOR SELECT USING (
        baby_id IN (
          SELECT baby_id FROM caregivers
          WHERE user_id = auth.uid() AND invite_status = 'accepted'
          UNION
          SELECT id FROM babies WHERE owner_id = auth.uid()
        )
      );

**Zustand Store Slices:**

    // stores/timer-store.ts — manages active sleep/feeding timers
    // stores/offline-store.ts — manages IndexedDB sync queue
    // stores/ui-store.ts — manages dark mode schedule, FAB state, active view

**API Routes (Next.js Route Handlers):**

    /api/invite — sends caregiver invite email via Resend
    /api/notifications/push — registers web push subscription
    /api/notifications/send — triggered by cron/edge function for scheduled reminders
    /api/export/pdf — generates PDF report for date range
    /api/webhooks/stripe — handles Stripe subscription events
    /api/growth/percentile — calculates WHO percentile for a given measurement

**Static Data Files:**

    /data/vaccinations/cdc.json — US CDC immunization schedule
    /data/vaccinations/nhs.json — UK NHS schedule
    /data/vaccinations/vn-nepi.json — Vietnam NEPI schedule
    /data/who-growth/ — WHO growth standard tables (weight, length, head, BMI by sex)
    /data/milestones.json — developmental milestone definitions with EN/VI translations


## Milestones

### Milestone 1 — Foundation
Scope: Project scaffolding, authentication, baby profile, i18n, PWA config, Vercel deploy. At the end of this milestone, a user can sign up, create a baby profile, and see an empty dashboard in English or Vietnamese.

### Milestone 2 — Core Tracking Trio
Scope: Feeding, sleep, and diaper trackers with FAB quick-log menu. At the end, all three event types can be logged and viewed on the dashboard.

### Milestone 3 — Dashboard & Timeline
Scope: Dashboard summary cards, timeline feed, view toggle, scheduled dark mode. At the end, the app feels like a real product with a useful home screen.

### Milestone 4 — Vaccination & Appointments
Scope: Vaccination schedule engine, appointment CRUD with attachments, Resend email reminders. At the end, a parent can track their baby's immunization status and upcoming doctor visits.

### Milestone 5 — Growth Charts & Milestones
Scope: Growth measurement logging, WHO percentile chart rendering, developmental milestone tracker. At the end, a parent can plot their baby's growth against WHO curves and track developmental progress.

### Milestone 6 — Offline Sync & Caregivers
Scope: IndexedDB-backed offline queue, timestamp-based sync engine, caregiver invite flow with RLS. At the end, the app works without internet and supports multiple users per baby.

### Milestone 7 — Analytics, PDF & Notifications
Scope: Analytics dashboard with charts and pattern detection, PDF export, push + email notification system. At the end, a parent can generate a pediatrician-ready report and receive proactive alerts.

### Milestone 8 — Freemium, Landing Page & Polish
Scope: Stripe billing, feature gating, marketing landing page, UX polish. At the end, the app is ready for public launch.


## Freemium Tier Breakdown

**Free tier includes:**
- Core tracking: feeding, sleep, diaper (unlimited logging)
- Vaccination tracker with preset schedules
- Growth measurement logging (manual log only, no percentile charts)
- Developmental milestones checklist
- Basic daily summary on dashboard
- Single user access
- Offline support
- Dark mode

**Premium tier adds:**
- WHO percentile growth charts with visual curves
- Full analytics dashboard (weekly trends, pattern detection, comparisons)
- PDF export for pediatrician visits
- Caregiver invites (up to 5 caregivers)
- Priority email notifications
- Appointment attachment uploads


## Design System

**Color Tokens (Light / Pastel):**

    --color-primary: #F8B4C8 (soft pink)
    --color-secondary: #B4D8F8 (soft blue)
    --color-accent: #F8E4B4 (soft cream/yellow)
    --color-background: #FFF8F5 (warm white)
    --color-surface: #FFFFFF
    --color-text-primary: #2D2D2D
    --color-text-secondary: #6B7280
    --color-success: #86EFAC (soft green)
    --color-warning: #FCD34D (soft amber)
    --color-error: #FCA5A5 (soft red)

**Color Tokens (Dark Mode):**

    --color-primary: #E8A0B4 (muted pink)
    --color-secondary: #A0C4E8 (muted blue)
    --color-accent: #E8D4A0 (muted cream)
    --color-background: #1A1A2E (deep navy)
    --color-surface: #242444 (dark purple-grey)
    --color-text-primary: #F0F0F0
    --color-text-secondary: #9CA3AF

**Typography:**
- Headings: Inter or Nunito (rounded, friendly)
- Body: Inter
- Monospace (for medical data): JetBrains Mono

**FAB Radial Menu:**
- Position: bottom-right, 24px from edges
- Collapsed: 56px circle with "+" icon
- Expanded: 5 radial options at 60px radius — Feed (bottle icon), Sleep (moon), Diaper (droplet), Weight (scale), More (ellipsis)
- Each option has an icon + label tooltip
- Tap outside to collapse


## Continuation Plan (2026-02-14 to 2026-02-21)

### Phase 1 — Release Blockers (Priority: P0)

1) Apple OAuth completion
- Scope: configure Supabase Apple provider, callback URLs, and login action wiring parity with Google/email.
- Deliverables:
  - Apple sign-in option visible and functional on login page.
  - Success/failure states mapped to existing auth error UX.
  - Regression test for callback failure path.
- Exit criteria:
  - Can sign in with Apple in preview and production.
  - No auth regressions in `npm run test:run`, `npm run typecheck`, `npm run build`.

2) Push notification delivery backend (completed 2026-02-14)
- Scope completed: push send path now uses VAPID-backed `web-push`, updates subscription health (`last_sent_at`, `last_error`, disable on 404/410), and writes push channel logs.
- Follow-up: validate end-to-end delivery against production push providers during release smoke QA.

3) Playwright smoke suite
- Scope: add minimal E2E coverage for launch-critical flows.
- Required scenarios:
  - Feed log save.
  - Start/stop timer render update.
  - Baby photo upload.
  - Offline queue replay.
  - Caregiver invite accept flow.
- Exit criteria:
  - Smoke suite runs in CI (or dedicated workflow) and is green.
  - Failures produce artifacts (trace/screenshot/video).

### Phase 2 — Production Hardening (Priority: P1)

1) Environment parity audit
- Scope: verify required vars across Vercel environments (`Production`, `Preview`) and Supabase config.
- Checklist:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `RESEND_API_KEY`, `CRON_SECRET`
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- Exit criteria:
  - No missing required vars in production.
  - Cron and webhook endpoints authenticate correctly in live checks.

2) Security and abuse regression pass
- Scope: rerun upload/invite/rate-limit/cron checks post-feature changes.
- Exit criteria:
  - No regressions against recent security fixes merged on `security-merge`.
  - Debug-only routes remain inaccessible in production.

### Phase 3 — Launch Readiness (Priority: P2)

1) Documentation alignment
- Scope: replace boilerplate README with project-specific setup + runbook links.
- Deliverables:
  - Local setup and env template guidance.
  - Test strategy (unit/integration/E2E) and commands.
  - Deployment + rollback notes linking `docs/operations/*`.

2) Final go/no-go checklist
- Scope: one pass across core user journeys on deployed app.
- Required flows:
  - New user onboarding.
  - Daily logging (feed/sleep/diaper).
  - Growth + milestones.
  - Vaccinations + appointment reminder.
  - Billing upgrade/downgrade behavior.
- Exit criteria:
  - All P0/P1 items closed.
  - Release decision documented with timestamp and owner.


## Revision Notes

- 2026-02-14: Added in-repo execution plan and continuation roadmap (P0/P1/P2 phases).
