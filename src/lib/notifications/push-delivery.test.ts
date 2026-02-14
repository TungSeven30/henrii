import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendNotificationMock, setVapidDetailsMock } = vi.hoisted(() => ({
  sendNotificationMock: vi.fn(),
  setVapidDetailsMock: vi.fn(),
}));

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: setVapidDetailsMock,
    sendNotification: sendNotificationMock,
  },
}));

import {
  getWebPushEnv,
  sendAppointmentPushNotification,
  type PushSubscriptionRecord,
} from "./push-delivery";

const validSubscription: PushSubscriptionRecord = {
  id: "sub_1",
  endpoint: "https://push.example.com/sub_1",
  p256dh: "p256dh_key",
  auth: "auth_key",
};

describe("push-delivery", () => {
  const originalPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const originalPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const originalSubject = process.env.VAPID_SUBJECT;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "public_key";
    process.env.VAPID_PRIVATE_KEY = "private_key";
    process.env.VAPID_SUBJECT = "mailto:test@henrii.app";
  });

  afterEach(() => {
    if (originalPublicKey === undefined) {
      delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    } else {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = originalPublicKey;
    }

    if (originalPrivateKey === undefined) {
      delete process.env.VAPID_PRIVATE_KEY;
    } else {
      process.env.VAPID_PRIVATE_KEY = originalPrivateKey;
    }

    if (originalSubject === undefined) {
      delete process.env.VAPID_SUBJECT;
    } else {
      process.env.VAPID_SUBJECT = originalSubject;
    }
  });

  it("returns null when VAPID env is incomplete", () => {
    delete process.env.VAPID_PRIVATE_KEY;

    expect(getWebPushEnv()).toBeNull();
  });

  it("returns config error when VAPID env is missing", async () => {
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    const result = await sendAppointmentPushNotification({
      subscription: validSubscription,
      payload: {
        appointmentId: "appt_1",
        title: "Pediatric check-up",
        scheduledAt: "2026-02-14T10:00:00.000Z",
        location: "City Clinic",
        notes: null,
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.statusCode).toBeNull();
      expect(result.disableSubscription).toBe(false);
      expect(result.error).toContain("Push notifications are not configured");
    }
    expect(sendNotificationMock).not.toHaveBeenCalled();
  });

  it("sends appointment notification when VAPID env is present", async () => {
    sendNotificationMock.mockResolvedValue({
      statusCode: 201,
      body: "",
      headers: {},
    });

    const result = await sendAppointmentPushNotification({
      subscription: validSubscription,
      payload: {
        appointmentId: "appt_1",
        title: "Pediatric check-up",
        scheduledAt: "2026-02-14T10:00:00.000Z",
        location: "City Clinic",
        notes: "Bring vaccination card",
      },
    });

    expect(result).toEqual({ ok: true });
    expect(setVapidDetailsMock).toHaveBeenCalledWith(
      "mailto:test@henrii.app",
      "public_key",
      "private_key",
    );
    expect(sendNotificationMock).toHaveBeenCalledOnce();
    expect(sendNotificationMock.mock.calls[0]?.[0]).toEqual({
      endpoint: validSubscription.endpoint,
      keys: {
        p256dh: validSubscription.p256dh,
        auth: validSubscription.auth,
      },
    });

    const payload = sendNotificationMock.mock.calls[0]?.[1];
    expect(typeof payload).toBe("string");
    expect(payload).toContain("Appointment reminder");
    expect(payload).toContain("/en/health");
  });

  it("marks subscription for disable on 410 response", async () => {
    sendNotificationMock.mockRejectedValue({
      statusCode: 410,
      body: "gone",
    });

    const result = await sendAppointmentPushNotification({
      subscription: validSubscription,
      payload: {
        appointmentId: "appt_1",
        title: "Pediatric check-up",
        scheduledAt: "2026-02-14T10:00:00.000Z",
        location: null,
        notes: null,
      },
    });

    expect(result).toEqual({
      ok: false,
      error: "gone",
      statusCode: 410,
      disableSubscription: true,
    });
  });
});
