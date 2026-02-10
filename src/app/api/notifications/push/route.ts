import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PushSubscriptionPayload = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as PushSubscriptionPayload | null;
  const endpoint = body?.endpoint?.trim() ?? "";
  const p256dh = body?.keys?.p256dh?.trim() ?? "";
  const auth = body?.keys?.auth?.trim() ?? "";

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid push subscription payload" }, { status: 400 });
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

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      baby_id: profile.active_baby_id,
      endpoint,
      p256dh,
      auth,
      enabled: true,
      last_error: null,
    },
    {
      onConflict: "user_id,baby_id,endpoint",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  const endpoint = body?.endpoint?.trim() ?? "";
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .update({ enabled: false })
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
