import { NextResponse } from "next/server";
import { canWriteToBaby } from "@/lib/billing/baby-plan";
import { mutateEvent, parseEventMutatePayload } from "@/lib/events/mutate-event";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = parseEventMutatePayload(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
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

  const canWrite = await canWriteToBaby({
    supabase: supabase as unknown as Parameters<typeof canWriteToBaby>[0]["supabase"],
    babyId: profile.active_baby_id,
    userId: user.id,
  });
  if (!canWrite) {
    return NextResponse.json(
      { error: "Caregiver edits are read-only until premium is active for this baby." },
      { status: 403 },
    );
  }

  const result = await mutateEvent({
    supabase,
    payload,
    userId: user.id,
    activeBabyId: profile.active_baby_id,
  });

  return NextResponse.json(result.body, { status: result.status });
}
