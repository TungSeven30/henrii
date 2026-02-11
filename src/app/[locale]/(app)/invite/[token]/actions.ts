"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

function getSafeLocale(rawLocale: string | null): string {
  if (rawLocale && routing.locales.includes(rawLocale as "en" | "vi")) {
    return rawLocale;
  }

  return routing.defaultLocale;
}

export async function acceptInviteAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const token = formData.get("token")?.toString() ?? "";

  if (!token) {
    redirect(`/${locale}/invite/invalid`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login?error=invite_login_required`);
  }

  const userEmail = user.email?.toLowerCase();
  if (!userEmail) {
    redirect(`/${locale}/invite/${token}?error=missing_email`);
  }

  const { data: invite, error: inviteError } = await supabase
    .from("caregiver_invites")
    .select("id, baby_id, email, role, accepted_at, revoked_at, expires_at")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    redirect(`/${locale}/invite/${token}?error=invalid`);
  }

  const isExpired = new Date(invite.expires_at).getTime() < Date.now();
  if (isExpired || invite.revoked_at) {
    redirect(`/${locale}/invite/${token}?error=expired`);
  }

  if (invite.email.toLowerCase() !== userEmail) {
    redirect(`/${locale}/invite/${token}?error=email_mismatch`);
  }

  const acceptedAt = new Date().toISOString();
  await supabase
    .from("caregiver_invites")
    .update({ accepted_at: acceptedAt })
    .eq("id", invite.id);

  await supabase
    .from("caregivers")
    .update({
      user_id: user.id,
      invite_status: "accepted",
      accepted_at: acceptedAt,
      role: invite.role,
    })
    .eq("baby_id", invite.baby_id)
    .eq("email", invite.email);

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .single();

  if (!profile?.active_baby_id) {
    await supabase
      .from("profiles")
      .update({ active_baby_id: invite.baby_id })
      .eq("id", user.id);
  }

  redirect(`/${locale}/dashboard?invite=accepted`);
}
