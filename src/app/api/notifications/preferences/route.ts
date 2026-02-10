import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EVENT_TYPES = [
  "appointment",
  "vaccination",
  "feeding_gap",
  "diaper_gap",
  "milestone",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

function isEventType(value: unknown): value is EventType {
  return typeof value === "string" && EVENT_TYPES.includes(value as EventType);
}

type PreferencePatch = {
  eventType: EventType;
  emailEnabled: boolean;
  pushEnabled: boolean;
  thresholdMinutes?: number | null;
};

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .single();

  if (!profile?.active_baby_id) {
    return NextResponse.json({ error: "No active baby selected" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("event_type, email_enabled, push_enabled, threshold_minutes")
    .eq("user_id", user.id)
    .eq("baby_id", profile.active_baby_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const byType = new Map((data ?? []).map((row) => [row.event_type, row]));
  const preferences = EVENT_TYPES.map((eventType) => {
    const row = byType.get(eventType);
    return {
      eventType,
      emailEnabled: row?.email_enabled ?? true,
      pushEnabled: row?.push_enabled ?? false,
      thresholdMinutes: row?.threshold_minutes ?? null,
    };
  });

  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { preferences?: PreferencePatch[] }
    | null;
  const patches = body?.preferences;
  if (!Array.isArray(patches) || patches.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const patch of patches) {
    if (!isEventType(patch.eventType)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .single();

  if (!profile?.active_baby_id) {
    return NextResponse.json({ error: "No active baby selected" }, { status: 409 });
  }

  const rows = patches.map((patch) => ({
    user_id: user.id,
    baby_id: profile.active_baby_id,
    event_type: patch.eventType,
    email_enabled: Boolean(patch.emailEnabled),
    push_enabled: Boolean(patch.pushEnabled),
    threshold_minutes:
      typeof patch.thresholdMinutes === "number" && patch.thresholdMinutes >= 0
        ? Math.round(patch.thresholdMinutes)
        : null,
  }));

  const { error } = await supabase.from("notification_preferences").upsert(rows, {
    onConflict: "user_id,baby_id,event_type",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
