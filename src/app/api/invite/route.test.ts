import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  sendEmailMock,
  resendConstructorMock,
  getUserPlanMock,
  createSupabaseServerClientMock,
} = vi.hoisted(() => {
  const sendEmail = vi.fn();
  return {
    sendEmailMock: sendEmail,
    resendConstructorMock: vi.fn(() => ({
      emails: {
        send: sendEmail,
      },
    })),
    getUserPlanMock: vi.fn(),
    createSupabaseServerClientMock: vi.fn(),
  };
});

vi.mock("resend", () => ({
  Resend: resendConstructorMock,
}));

vi.mock("@/lib/billing/plan", () => ({
  getUserPlan: getUserPlanMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: createSupabaseServerClientMock,
}));

import { POST } from "./route";

type PostSupabaseOptions = {
  userId?: string | null;
  activeBabyId?: string | null;
  ownedBaby?: { id: string; name: string } | null;
  recentInviteCount?: number;
  caregiverError?: string | null;
  inviteError?: string | null;
};

function createPostSupabaseMock(options: PostSupabaseOptions = {}) {
  const userId = options.userId === undefined ? "user_1" : options.userId;
  const activeBabyId =
    options.activeBabyId === undefined ? "baby_1" : options.activeBabyId;
  const ownedBaby =
    options.ownedBaby === undefined
      ? { id: "baby_1", name: "Henry" }
      : options.ownedBaby;

  const getUser = vi.fn().mockResolvedValue({
    data: { user: userId ? { id: userId } : null },
    error: null,
  });

  const profileSingle = vi.fn().mockResolvedValue({
    data: activeBabyId ? { active_baby_id: activeBabyId } : null,
    error: null,
  });

  const babySingle = vi.fn().mockResolvedValue({
    data: ownedBaby,
    error: null,
  });

  const inviteCount = vi.fn().mockResolvedValue({
    count: options.recentInviteCount ?? 0,
    error: null,
  });

  const insertInviteRateLimit = vi.fn().mockResolvedValue({ error: null });
  const upsertCaregiver = vi.fn().mockResolvedValue({
    error: options.caregiverError
      ? { message: options.caregiverError }
      : null,
  });
  const insertInvite = vi.fn().mockResolvedValue({
    error: options.inviteError ? { message: options.inviteError } : null,
  });

  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: profileSingle,
          })),
        })),
      };
    }

    if (table === "babies") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: babySingle,
            })),
          })),
        })),
      };
    }

    if (table === "invite_rate_limits") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: inviteCount,
          })),
        })),
        insert: insertInviteRateLimit,
      };
    }

    if (table === "caregivers") {
      return {
        upsert: upsertCaregiver,
      };
    }

    if (table === "caregiver_invites") {
      return {
        insert: insertInvite,
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    supabase: {
      auth: {
        getUser,
      },
      from,
    },
    getUser,
    from,
    insertInviteRateLimit,
    upsertCaregiver,
    insertInvite,
  };
}

function createInvitePostRequest(body: Record<string, unknown>) {
  return new Request("https://app.henrii.app/api/invite", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/invite", () => {
  const originalResendApiKey = process.env.RESEND_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    getUserPlanMock.mockResolvedValue({ plan: "premium", premium: true });
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
      return;
    }

    process.env.RESEND_API_KEY = originalResendApiKey;
  });

  it("returns 400 for invalid email payload", async () => {
    const response = await POST(
      createInvitePostRequest({
        email: "invalid-email",
      }),
    );

    expect(response.status).toBe(400);
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("returns 401 when user is not authenticated", async () => {
    const { supabase } = createPostSupabaseMock({ userId: null });
    createSupabaseServerClientMock.mockResolvedValue(supabase);

    const response = await POST(
      createInvitePostRequest({
        email: "caregiver@example.com",
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns ok with emailFailed and never exposes invite link when email sending fails", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    sendEmailMock.mockResolvedValue({
      error: {
        message: "smtp_failed",
      },
    });

    const { supabase } = createPostSupabaseMock();
    createSupabaseServerClientMock.mockResolvedValue(supabase);

    const response = await POST(
      createInvitePostRequest({
        email: "caregiver@example.com",
        role: "caregiver",
        locale: "en",
      }),
    );

    const payload = (await response.json()) as Record<string, unknown>;
    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      emailFailed: true,
    });
    expect(payload.inviteLink).toBeUndefined();
    expect(resendConstructorMock).toHaveBeenCalledWith("re_test_key");
    expect(sendEmailMock).toHaveBeenCalledOnce();
  });

  it("returns ok and does not expose invite link on success", async () => {
    const { supabase } = createPostSupabaseMock();
    createSupabaseServerClientMock.mockResolvedValue(supabase);

    const response = await POST(
      createInvitePostRequest({
        email: "caregiver@example.com",
      }),
    );

    const payload = (await response.json()) as Record<string, unknown>;
    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(payload.inviteLink).toBeUndefined();
  });
});
