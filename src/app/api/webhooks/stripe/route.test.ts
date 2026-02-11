import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getHeaderMock,
  constructEventMock,
  retrieveSubscriptionMock,
  stripeConstructorMock,
  upsertMock,
  fromMock,
  createSupabaseAdminClientMock,
} = vi.hoisted(() => {
  const getHeader = vi.fn();
  const constructEvent = vi.fn();
  const retrieveSubscription = vi.fn();
  const upsert = vi.fn();
  const from = vi.fn(() => ({
    upsert,
  }));

  return {
    getHeaderMock: getHeader,
    constructEventMock: constructEvent,
    retrieveSubscriptionMock: retrieveSubscription,
    stripeConstructorMock: vi.fn(() => ({
      webhooks: {
        constructEvent,
      },
      subscriptions: {
        retrieve: retrieveSubscription,
      },
    })),
    upsertMock: upsert,
    fromMock: from,
    createSupabaseAdminClientMock: vi.fn(() => ({
      from,
    })),
  };
});

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: getHeaderMock,
  })),
}));

vi.mock("stripe", () => ({
  default: stripeConstructorMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock,
}));

import { POST } from "./route";

function createWebhookRequest(rawBody = "{}") {
  return new Request("https://app.henrii.app/api/webhooks/stripe", {
    method: "POST",
    body: rawBody,
  });
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
  });

  it("returns 503 when stripe secrets are not configured", async () => {
    process.env.STRIPE_SECRET_KEY = "";
    process.env.STRIPE_WEBHOOK_SECRET = "";

    const response = await POST(createWebhookRequest());
    expect(response.status).toBe(503);
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    getHeaderMock.mockReturnValue(null);

    const response = await POST(createWebhookRequest());
    expect(response.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("ignores checkout completion without user id", async () => {
    getHeaderMock.mockReturnValue("sig_test");
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: null,
          metadata: {},
        },
      },
    });

    const response = await POST(createWebhookRequest("{\"raw\":true}"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      ignored: "missing_user_id",
    });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("upserts premium subscription from checkout session with period dates", async () => {
    getHeaderMock.mockReturnValue("sig_test");
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: "user_1",
          customer: "cus_1",
          subscription: "sub_1",
          metadata: {},
        },
      },
    });
    retrieveSubscriptionMock.mockResolvedValue({
      current_period_start: 1_700_000_000,
      current_period_end: 1_700_086_400,
    });

    const response = await POST(createWebhookRequest("{\"raw\":true}"));
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload).toEqual({ received: true });
    expect(upsertMock).toHaveBeenCalledWith(
      {
        user_id: "user_1",
        plan: "premium",
        status: "active",
        stripe_customer_id: "cus_1",
        stripe_subscription_id: "sub_1",
        current_period_start: new Date(1_700_000_000 * 1000).toISOString(),
        current_period_end: new Date(1_700_086_400 * 1000).toISOString(),
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: false,
      },
    );
    expect(fromMock).toHaveBeenCalledWith("subscriptions");
  });

  it("maps deleted subscription to free/canceled", async () => {
    getHeaderMock.mockReturnValue("sig_test");
    constructEventMock.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_2",
          customer: "cus_2",
          status: "canceled",
          metadata: {
            user_id: "user_2",
          },
          current_period_start: 1_700_000_000,
          current_period_end: 1_700_086_400,
        },
      },
    });

    const response = await POST(createWebhookRequest("{\"raw\":true}"));
    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(
      {
        user_id: "user_2",
        plan: "free",
        status: "canceled",
        stripe_customer_id: "cus_2",
        stripe_subscription_id: "sub_2",
        current_period_start: new Date(1_700_000_000 * 1000).toISOString(),
        current_period_end: new Date(1_700_086_400 * 1000).toISOString(),
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: false,
      },
    );
  });
});
