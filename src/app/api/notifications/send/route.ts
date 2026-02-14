import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  sendAppointmentPushNotification,
  type PushSubscriptionRecord,
} from "@/lib/notifications/push-delivery";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getNowWindow() {
  const now = new Date();
  const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return {
    now,
    deadline,
  };
}

type AppointmentRow = {
  id: string;
  baby_id: string;
  title: string;
  scheduled_at: string;
  location: string | null;
  notes: string | null;
  created_by: string;
};

type NotificationPreferenceRow = {
  email_enabled: boolean;
  push_enabled: boolean;
};

export async function POST(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }

  const provided = request.headers.get("x-cron-secret");
  if (provided !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY configuration" },
      { status: 503 },
    );
  }

  const { now, deadline } = getNowWindow();
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, baby_id, title, scheduled_at, location, notes, created_by")
    .eq("status", "scheduled")
    .is("reminder_sent_at", null)
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", deadline.toISOString());

  if (appointmentsError) {
    return NextResponse.json({ error: appointmentsError.message }, { status: 500 });
  }

  const rows = (appointments ?? []) as AppointmentRow[];
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0 });
  }

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  let sent = 0;
  let skipped = 0;

  for (const appointment of rows) {
    let appointmentEmailSent = false;
    let appointmentPushSent = false;
    const { data: preference } = await supabase
      .from("notification_preferences")
      .select("email_enabled, push_enabled")
      .eq("user_id", appointment.created_by)
      .eq("baby_id", appointment.baby_id)
      .eq("event_type", "appointment")
      .maybeSingle();

    const typedPreference = preference as NotificationPreferenceRow | null;
    const emailEnabled = typedPreference?.email_enabled ?? true;
    const pushEnabled = typedPreference?.push_enabled ?? false;

    if (!emailEnabled) {
      skipped += 1;
      await supabase.from("notification_logs").insert({
        appointment_id: appointment.id,
        user_id: appointment.created_by,
        channel: "email",
        status: "skipped",
        error_message: "Email disabled by notification preferences",
      });
    }

    const { data: userResult } = await supabase.auth.admin.getUserById(appointment.created_by);
    const recipient = userResult.user?.email;

    if (!recipient && emailEnabled) {
      skipped += 1;
      await supabase.from("notification_logs").insert({
        appointment_id: appointment.id,
        user_id: appointment.created_by,
        channel: "email",
        status: "skipped",
        error_message: "Missing recipient email",
      });
      continue;
    }

    if (!resend && emailEnabled) {
      skipped += 1;
      await supabase.from("notification_logs").insert({
        appointment_id: appointment.id,
        user_id: appointment.created_by,
        channel: "email",
        status: "skipped",
        error_message: "RESEND_API_KEY not set",
      });
      continue;
    }

    if (emailEnabled && resend && recipient) {
      const emailResult = await resend.emails.send({
        from: "henrii <notifications@henrii.app>",
        to: [recipient],
        subject: `Appointment reminder: ${appointment.title}`,
        text: `Upcoming appointment: ${appointment.title}\nTime: ${new Date(appointment.scheduled_at).toLocaleString()}\nLocation: ${appointment.location ?? "N/A"}\nNotes: ${appointment.notes ?? "N/A"}`,
      });

      if (emailResult.error) {
        skipped += 1;
        await supabase.from("notification_logs").insert({
          appointment_id: appointment.id,
          user_id: appointment.created_by,
          channel: "email",
          status: "failed",
          error_message: emailResult.error.message,
        });
      } else {
        sent += 1;
        appointmentEmailSent = true;
        await supabase.from("notification_logs").insert({
          appointment_id: appointment.id,
          user_id: appointment.created_by,
          channel: "email",
          status: "sent",
        });
      }
    }

    if (pushEnabled) {
      const { data: pushSubscriptions } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", appointment.created_by)
        .eq("baby_id", appointment.baby_id)
        .eq("enabled", true);

      const subscriptionRows = (pushSubscriptions ?? []) as PushSubscriptionRecord[];
      if (!subscriptionRows.length) {
        skipped += 1;
        await supabase.from("notification_logs").insert({
          appointment_id: appointment.id,
          user_id: appointment.created_by,
          channel: "push",
          status: "skipped",
          error_message: "No active push subscriptions",
        });
      }

      for (const subscription of subscriptionRows) {
        const pushResult = await sendAppointmentPushNotification({
          subscription,
          payload: {
            appointmentId: appointment.id,
            title: appointment.title,
            scheduledAt: appointment.scheduled_at,
            location: appointment.location,
            notes: appointment.notes,
          },
        });

        if (pushResult.ok) {
          sent += 1;
          appointmentPushSent = true;
          await supabase
            .from("push_subscriptions")
            .update({
              last_sent_at: new Date().toISOString(),
              last_error: null,
            })
            .eq("id", subscription.id);
          await supabase.from("notification_logs").insert({
            appointment_id: appointment.id,
            user_id: appointment.created_by,
            channel: "push",
            status: "sent",
          });
          continue;
        }

        skipped += 1;
        await supabase
          .from("push_subscriptions")
          .update({
            last_error: pushResult.error,
            enabled: pushResult.disableSubscription ? false : true,
          })
          .eq("id", subscription.id);
        await supabase.from("notification_logs").insert({
          appointment_id: appointment.id,
          user_id: appointment.created_by,
          channel: "push",
          status: pushResult.disableSubscription ? "failed" : "skipped",
          error_message: pushResult.error,
        });
      }
    }

    if (!emailEnabled && !pushEnabled) {
      await supabase.from("notification_logs").insert({
        appointment_id: appointment.id,
        user_id: appointment.created_by,
        channel: "email",
        status: "skipped",
        error_message: "All notification channels disabled by user preferences",
      });
    }

    if (appointmentEmailSent || appointmentPushSent || (!emailEnabled && !pushEnabled)) {
      await supabase
        .from("appointments")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", appointment.id);
    } else {
      await supabase.from("notification_logs").insert({
        appointment_id: appointment.id,
        user_id: appointment.created_by,
        channel: "email",
        status: "skipped",
        error_message: "Reminder will retry on next run",
      });
    }
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
