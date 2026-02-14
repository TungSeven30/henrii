# Playwright Smoke Suite

This suite covers release-critical flows:

- feed log save
- timer start/stop update
- baby photo upload
- offline queue replay
- invite acceptance

## Prerequisites

1. Install browsers:

```bash
npx playwright install --with-deps chromium
```

2. Create authenticated storage state (one-time per account/session):

```bash
npx playwright codegen http://127.0.0.1:3000/en/login --save-storage=playwright/.auth/user.json
```

Complete sign-in in the opened browser, then close it.

## Run

Local app:

```bash
npm run test:smoke
```

Authenticated release smoke (fails fast when state is missing):

```bash
PLAYWRIGHT_REQUIRE_AUTH=1 npm run test:smoke
```

Full release hardening pass:

```bash
npm run verify:release
```

Against deployed app:

```bash
PLAYWRIGHT_BASE_URL=https://app.henrii.app npm run test:smoke
```

Optional invite flow coverage:

```bash
PLAYWRIGHT_INVITE_TOKEN=<token> npm run test:smoke
```

## Notes

- Tests are intentionally serial because they mutate timeline data for the same baby.
- If `playwright/.auth/user.json` is missing, tests are skipped.

For production-like validation, set `VERIFY_BASE_URL` (or `PLAYWRIGHT_BASE_URL`) and run:

```bash
VERIFY_BASE_URL=https://app.henrii.app npm run verify:production-config
```

Stripe checks are optional by default for now. To enforce Stripe checks, run:

```bash
VERIFY_STRIPE_REQUIRED=1 VERIFY_BASE_URL=https://app.henrii.app npm run verify:production-config
```
