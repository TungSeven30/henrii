import webpush from "web-push";

type PushEnv = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

export type PushSubscriptionRecord = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type AppointmentPushPayload = {
  appointmentId: string;
  title: string;
  scheduledAt: string;
  location: string | null;
  notes: string | null;
};

export type PushDeliveryResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      statusCode: number | null;
      disableSubscription: boolean;
    };

const RETIRED_SUBSCRIPTION_STATUS_CODES = new Set([404, 410]);

let configuredVapidKeyFingerprint: string | null = null;

export function getWebPushEnv(
  env: NodeJS.ProcessEnv = process.env,
): PushEnv | null {
  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
  const privateKey = env.VAPID_PRIVATE_KEY?.trim() ?? "";
  const subject = env.VAPID_SUBJECT?.trim() ?? "";

  if (!publicKey || !privateKey || !subject) {
    return null;
  }

  return {
    publicKey,
    privateKey,
    subject,
  };
}

function ensureVapidConfigured(vapidEnv: PushEnv) {
  const fingerprint = `${vapidEnv.subject}:${vapidEnv.publicKey}:${vapidEnv.privateKey}`;
  if (configuredVapidKeyFingerprint === fingerprint) {
    return;
  }

  webpush.setVapidDetails(
    vapidEnv.subject,
    vapidEnv.publicKey,
    vapidEnv.privateKey,
  );
  configuredVapidKeyFingerprint = fingerprint;
}

function buildAppointmentPushBody(payload: AppointmentPushPayload) {
  const readableTime = new Date(payload.scheduledAt).toLocaleString();
  return {
    title: "Appointment reminder",
    body: `${payload.title} • ${readableTime}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    url: "/en/health",
    tag: `appointment-${payload.appointmentId}`,
    data: {
      appointmentId: payload.appointmentId,
      location: payload.location ?? null,
      notes: payload.notes ?? null,
    },
  };
}

export async function sendAppointmentPushNotification({
  subscription,
  payload,
}: {
  subscription: PushSubscriptionRecord;
  payload: AppointmentPushPayload;
}): Promise<PushDeliveryResult> {
  const vapidEnv = getWebPushEnv();
  if (!vapidEnv) {
    return {
      ok: false,
      error:
        "Push notifications are not configured. Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, or VAPID_SUBJECT.",
      statusCode: null,
      disableSubscription: false,
    };
  }

  ensureVapidConfigured(vapidEnv);

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(buildAppointmentPushBody(payload)),
      {
        TTL: 60 * 60,
        urgency: "high",
      },
    );

    return { ok: true };
  } catch (error) {
    const webPushError = error as {
      statusCode?: number;
      body?: string;
      message?: string;
    };
    const statusCode =
      typeof webPushError.statusCode === "number"
        ? webPushError.statusCode
        : null;
    const errorMessage =
      webPushError.body?.trim() ||
      webPushError.message?.trim() ||
      "Unknown push delivery error";

    return {
      ok: false,
      error: errorMessage,
      statusCode,
      disableSubscription:
        statusCode !== null &&
        RETIRED_SUBSCRIPTION_STATUS_CODES.has(statusCode),
    };
  }
}
