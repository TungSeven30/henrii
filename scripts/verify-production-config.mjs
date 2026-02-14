#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "CRON_SECRET",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
];

const stripeEnv = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
];

const stripeRequired =
  process.env.VERIFY_STRIPE_REQUIRED === "1" ||
  process.env.STRIPE_REQUIRED === "1";
if (stripeRequired) {
  requiredEnv.push(...stripeEnv);
}

const remoteBase =
  process.env.VERIFY_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

function parseEnvFile(filePath) {
  const env = {};
  if (!existsSync(filePath)) {
    return env;
  }

  const lines = readFileSync(filePath, "utf8").split(/\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value =
      rawValue.startsWith('"') && rawValue.endsWith('"')
        ? rawValue.slice(1, -1)
        : rawValue;

    env[key] = value;
  }

  return env;
}

const candidateEnvFile =
  process.env.VERIFY_ENV_FILE ||
  (existsSync(resolve(process.cwd(), ".env.production.local"))
    ? ".env.production.local"
    : ".env.local");

const mergedEnv = {
  ...parseEnvFile(resolve(process.cwd(), candidateEnvFile)),
  ...process.env,
};

const missingEnv = requiredEnv.filter((key) => {
  const value = mergedEnv[key];
  return !value;
});

if (missingEnv.length > 0) {
  console.error("✗ Missing required production env vars:");
  for (const key of missingEnv) {
    console.error(`  - ${key}`);
  }
  process.exit(1);
}

const routeChecks = [
  {
    name: "cron reminders endpoint auth gate",
    url: `${remoteBase}/api/cron/reminders`,
    init: { method: "GET" },
    expected: [401, 503],
  },
  {
    name: "notification sender endpoint auth gate",
    url: `${remoteBase}/api/notifications/send`,
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    },
    expected: [401, 503],
  },
];

if (stripeRequired) {
  routeChecks.push({
    name: "stripe webhook hard-fail gate",
    url: `${remoteBase}/api/webhooks/stripe`,
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    },
    expected: [400, 503],
  });
}

async function checkRoutes() {
  const failures = [];

  for (const check of routeChecks) {
    try {
      const response = await fetch(check.url, {
        ...check.init,
        redirect: "manual",
      });

      if (!check.expected.includes(response.status)) {
        failures.push(
          `${check.name} expected ${check.expected.join("/")} but got ${response.status}`,
        );
      }
    } catch (error) {
      failures.push(`${check.name} request failed: ${String(error?.message ?? error)}`);
    }
  }

  return failures;
}

const failures = await checkRoutes();
if (failures.length > 0) {
  console.error("✗ Runtime route checks failed:");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `✓ Production configuration check passed for ${candidateEnvFile} against ${remoteBase}`,
);
