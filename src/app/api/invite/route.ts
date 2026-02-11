import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getUserPlan } from "@/lib/billing/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_INVITES_PER_HOUR = 5;

type InviteRequestBody = {
  email?: string;
  role?: "admin" | "caregiver";
  locale?: string;
};

type RevokeInviteRequestBody = {
  caregiverId?: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getBaseUrl(request: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as InviteRequestBody;
  const targetEmail = body.email ? normalizeEmail(body.email) : "";
  const role = body.role === "admin" ? "admin" : "caregiver";
  const locale = body.locale === "vi" ? "vi" : "en";

  if (!targetEmail || !targetEmail.includes("@")) {
    return NextResponse.json({ error: "Invalid invite email" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan({
    supabase,
    userId: user.id,
  });
  if (!plan.premium) {
    return NextResponse.json(
      { error: "Caregiver invites require a premium subscription." },
      { status: 402 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .single();

  if (!profile?.active_baby_id) {
    return NextResponse.json({ error: "No active baby selected" }, { status: 409 });
  }

  const { data: ownedBaby } = await supabase
    .from("babies")
    .select("id, name")
    .eq("id", profile.active_baby_id)
    .eq("owner_id", user.id)
    .single();

  if (!ownedBaby) {
    return NextResponse.json({ error: "Only baby owners can invite caregivers" }, { status: 403 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentInviteCount } = await supabase
    .from("invite_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);

  if ((recentInviteCount ?? 0) >= MAX_INVITES_PER_HOUR) {
    return NextResponse.json(
      { error: "Invite rate limit exceeded. Please try again later." },
      { status: 429 },
    );
  }

  await supabase.from("invite_rate_limits").insert({ user_id: user.id });

  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: caregiverError } = await supabase.from("caregivers").upsert(
    {
      baby_id: ownedBaby.id,
      email: targetEmail,
      role,
      invite_status: "pending",
      invited_by: user.id,
      user_id: null,
      accepted_at: null,
    },
    {
      onConflict: "baby_id,email",
      ignoreDuplicates: false,
    },
  );

  if (caregiverError) {
    return NextResponse.json({ error: caregiverError.message }, { status: 400 });
  }

  const { error: inviteError } = await supabase.from("caregiver_invites").insert({
    baby_id: ownedBaby.id,
    email: targetEmail,
    role,
    token: inviteToken,
    invited_by: user.id,
    expires_at: expiresAt,
  });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  const inviteLink = `${getBaseUrl(request)}/${locale}/invite/${inviteToken}`;

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const sendResult = await resend.emails.send({
      from: "henrii <notifications@henrii.app>",
      to: [targetEmail],
      subject: `You were invited to collaborate on ${ownedBaby.name}`,
      text: `You have been invited as a ${role} on ${ownedBaby.name} in henrii.\nAccept invite: ${inviteLink}\nThis link expires in 7 days.`,
    });

    if (sendResult.error) {
      return NextResponse.json({ ok: true, emailFailed: true });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RevokeInviteRequestBody;
  const caregiverId = body.caregiverId?.trim() ?? "";
  if (!caregiverId) {
    return NextResponse.json({ error: "Missing caregiver id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: caregiver, error: caregiverError } = await supabase
    .from("caregivers")
    .select("id, baby_id, email")
    .eq("id", caregiverId)
    .maybeSingle();

  if (caregiverError || !caregiver) {
    return NextResponse.json({ error: "Caregiver not found" }, { status: 404 });
  }

  const { data: baby } = await supabase
    .from("babies")
    .select("owner_id")
    .eq("id", caregiver.baby_id)
    .maybeSingle();

  if (!baby || baby.owner_id !== user.id) {
    return NextResponse.json({ error: "Only the baby owner can revoke caregivers" }, { status: 403 });
  }

  const now = new Date().toISOString();
  const { error: updateCaregiverError } = await supabase
    .from("caregivers")
    .update({
      invite_status: "revoked",
      accepted_at: null,
      user_id: null,
    })
    .eq("id", caregiver.id);

  if (updateCaregiverError) {
    return NextResponse.json({ error: updateCaregiverError.message }, { status: 400 });
  }

  await supabase
    .from("caregiver_invites")
    .update({ revoked_at: now })
    .eq("baby_id", caregiver.baby_id)
    .eq("email", caregiver.email)
    .is("revoked_at", null);

  return NextResponse.json({ ok: true });
}
