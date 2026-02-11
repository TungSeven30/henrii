import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const createSupabaseAdminClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock,
}));

import { GET } from "./route";

describe("GET /api/cron/reminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-cron-secret";
  });

  it("should reject requests with 503 if CRON_SECRET is not configured", async () => {
    process.env.CRON_SECRET = "";

    const request = new NextRequest("https://app.henrii.app/api/cron/reminders", {
      method: "GET",
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("CRON_SECRET not configured");
  });

  it("should reject requests with 401 if authorization header is missing", async () => {
    const request = new NextRequest("https://app.henrii.app/api/cron/reminders", {
      method: "GET",
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("should reject requests with 401 if authorization header is invalid", async () => {
    const request = new NextRequest("https://app.henrii.app/api/cron/reminders", {
      method: "GET",
      headers: {
        authorization: "Bearer wrong-secret",
      },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});
