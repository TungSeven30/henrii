import { beforeEach, describe, expect, it, vi } from "vitest";

const createSupabaseAdminClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock,
}));

import { POST } from "./route";

describe("POST /api/notifications/send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-cron-secret";
  });

  it("should reject requests with 503 if CRON_SECRET is not configured", async () => {
    process.env.CRON_SECRET = "";

    const request = new Request("https://app.henrii.app/api/notifications/send", {
      method: "POST",
      headers: {
        "x-cron-secret": "some-secret",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("CRON_SECRET not configured");
  });

  it("should reject requests with 401 if x-cron-secret header is missing", async () => {
    const request = new Request("https://app.henrii.app/api/notifications/send", {
      method: "POST",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("should reject requests with 401 if x-cron-secret header is invalid", async () => {
    const request = new Request("https://app.henrii.app/api/notifications/send", {
      method: "POST",
      headers: {
        "x-cron-secret": "wrong-secret",
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});
