import { NextRequest, NextResponse } from "next/server";
import { POST as sendNotifications } from "@/app/api/notifications/send/route";

/**
 * GET /api/cron/reminders
 *
 * Canonical cron endpoint for Vercel. This reuses the existing
 * notification delivery pipeline in /api/notifications/send.
 */
export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const delegated = new Request(request.url, {
    method: "POST",
    headers: {
      "x-cron-secret": process.env.CRON_SECRET ?? "",
      "content-type": "application/json",
    },
  });

  return sendNotifications(delegated);
}
