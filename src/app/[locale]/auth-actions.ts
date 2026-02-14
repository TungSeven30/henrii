"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeBabySex } from "@/lib/babies/sex";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

function getSafeLocale(rawLocale: string | null): string {
  if (rawLocale && routing.locales.includes(rawLocale as "en" | "vi")) {
    return rawLocale;
  }

  return routing.defaultLocale;
}

function isValidIsoDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isFutureIsoDate(value: string) {
  const today = new Date().toISOString().slice(0, 10);
  return value > today;
}

async function getOrigin() {
  const requestHeaders = await headers();
  const requestOrigin = requestHeaders.get("origin");

  if (requestOrigin) {
    return requestOrigin;
  }

  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  if (forwardedHost) {
    return `${forwardedProto ?? "http"}://${forwardedHost}`;
  }

  const host = requestHeaders.get("host");
  if (host) {
    return `http://${host}`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  return "http://localhost:3101";
}

export async function signInWithGoogleAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/${locale}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/${locale}/login?error=oauth_failed`);
  }

  redirect(data.url);
}

export async function signInWithEmailAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";

  if (!email) {
    redirect(`/${locale}/login?error=missing_email`);
  }

  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/${locale}/auth/email-callback`,
    },
  });

  if (error) {
    redirect(`/${locale}/login?error=email_signin_failed`);
  }

  redirect(`/${locale}/login?checkEmail=1`);
}

export async function signOutAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}

export async function createBabyProfileAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const name = formData.get("name")?.toString().trim() ?? "";
  const dateOfBirth = formData.get("dateOfBirth")?.toString() ?? "";
  const sex = normalizeBabySex(formData.get("sex")?.toString());
  const countryCode = formData.get("countryCode")?.toString() ?? "US";
  const timezone = formData.get("timezone")?.toString() ?? "UTC";

  if (!name || !dateOfBirth) {
    redirect(`/${locale}/onboarding?error=missing_fields`);
  }

  if (!isValidIsoDateInput(dateOfBirth) || isFutureIsoDate(dateOfBirth)) {
    redirect(`/${locale}/onboarding?error=invalid_dob`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login?error=unauthorized`);
  }

  const { data: insertedBaby, error: insertBabyError } = await supabase
    .from("babies")
    .insert({
      owner_id: user.id,
      name,
      date_of_birth: dateOfBirth,
      sex,
      country_code: countryCode,
      timezone,
    })
    .select("id")
    .single();

  if (insertBabyError || !insertedBaby) {
    redirect(`/${locale}/onboarding?error=baby_create_failed`);
  }

  await supabase.from("caregivers").upsert(
    {
      baby_id: insertedBaby.id,
      user_id: user.id,
      email: user.email ?? "owner@local.dev",
      role: "admin",
      invite_status: "accepted",
      invited_by: user.id,
      accepted_at: new Date().toISOString(),
    },
    {
      onConflict: "baby_id,user_id",
      ignoreDuplicates: false,
    },
  );

  const { error: updateProfileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      active_baby_id: insertedBaby.id,
      full_name:
        user.user_metadata?.full_name?.toString() ??
        user.email?.split("@")[0] ??
        "Parent",
    },
    {
      onConflict: "id",
      ignoreDuplicates: false,
    },
  );

  if (updateProfileError) {
    redirect(`/${locale}/onboarding?error=profile_update_failed`);
  }

  redirect(`/${locale}/dashboard?onboarded=1`);
}

export async function updateBabyProfileAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const babyId = formData.get("babyId")?.toString() ?? "";
  const name = formData.get("name")?.toString().trim() ?? "";
  const dateOfBirth = formData.get("dateOfBirth")?.toString() ?? "";
  const sex = normalizeBabySex(formData.get("sex")?.toString());
  const countryCode = formData.get("countryCode")?.toString() ?? "US";
  const timezone = formData.get("timezone")?.toString() ?? "UTC";

  if (!babyId || !name || !dateOfBirth) {
    redirect(`/${locale}/baby?error=missing_fields`);
  }

  if (!isValidIsoDateInput(dateOfBirth) || isFutureIsoDate(dateOfBirth)) {
    redirect(`/${locale}/baby?error=invalid_dob`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login?error=unauthorized`);
  }

  const { error } = await supabase
    .from("babies")
    .update({
      name,
      date_of_birth: dateOfBirth,
      sex,
      country_code: countryCode,
      timezone,
    })
    .eq("id", babyId)
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/${locale}/baby?error=update_failed`);
  }

  redirect(`/${locale}/baby?saved=1`);
}

export async function deleteBabyProfileAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const babyId = formData.get("babyId")?.toString() ?? "";

  if (!babyId) {
    redirect(`/${locale}/baby?error=missing_baby`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/login?error=unauthorized`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      active_baby_id: null,
    })
    .eq("id", user.id);

  if (profileError) {
    redirect(`/${locale}/baby?error=unlink_failed`);
  }

  const { error: deleteError } = await supabase
    .from("babies")
    .delete()
    .eq("id", babyId)
    .eq("owner_id", user.id);

  if (deleteError) {
    redirect(`/${locale}/baby?error=delete_failed`);
  }

  redirect(`/${locale}/onboarding?deleted=1`);
}
