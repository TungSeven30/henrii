"use server";

import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { canWriteToBaby } from "@/lib/billing/baby-plan";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";

const ALLOWED_FEEDING_TYPES = new Set(["bottle", "breast", "solid"]);
const ALLOWED_DIAPER_TYPES = new Set(["wet", "dirty", "mixed"]);

function getSafeLocale(rawLocale: string | null): string {
  if (rawLocale && routing.locales.includes(rawLocale as "en" | "vi")) {
    return rawLocale;
  }

  return routing.defaultLocale;
}

async function ensureCanWriteOrRedirect({
  locale,
  supabase,
  activeBabyId,
  userId,
}: {
  locale: string;
  supabase: Awaited<ReturnType<typeof getActiveBabyContext>>["supabase"];
  activeBabyId: string;
  userId: string;
}) {
  const canWrite = await canWriteToBaby({
    supabase: supabase as unknown as Parameters<typeof canWriteToBaby>[0]["supabase"],
    babyId: activeBabyId,
    userId,
  });

  if (!canWrite) {
    redirect(`/${locale}/dashboard?error=read_only`);
  }
}

export async function logFeedingAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const feedingTypeRaw = formData.get("feedingType")?.toString() ?? "bottle";
  const feedingType = ALLOWED_FEEDING_TYPES.has(feedingTypeRaw)
    ? feedingTypeRaw
    : "bottle";
  const amountMlRaw = formData.get("amountMl")?.toString() ?? "";
  const amountMlParsed = amountMlRaw ? Number.parseInt(amountMlRaw, 10) : null;
  const amountMl =
    amountMlParsed !== null && Number.isFinite(amountMlParsed) && amountMlParsed > 0
      ? Math.min(amountMlParsed, 2000)
      : null;

  const { supabase, userId, activeBabyId } = await getActiveBabyContext(locale);
  await ensureCanWriteOrRedirect({ locale, supabase, activeBabyId, userId });

  const { error } = await supabase.from("feedings").insert({
    baby_id: activeBabyId,
    logged_by: userId,
    feeding_type: feedingType,
    amount_ml: amountMl,
    started_at: new Date().toISOString(),
    client_uuid: crypto.randomUUID(),
  });

  if (error) {
    redirect(`/${locale}/dashboard?error=feeding_failed`);
  }

  redirect(`/${locale}/dashboard?logged=feed`);
}

export async function logSleepAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const minutesRaw = formData.get("minutes")?.toString() ?? "0";
  const durationMinutes = Number.parseInt(minutesRaw, 10);
  const safeDurationMinutes = Number.isNaN(durationMinutes)
    ? 0
    : Math.min(Math.max(durationMinutes, 0), 24 * 60);

  const { supabase, userId, activeBabyId } = await getActiveBabyContext(locale);
  await ensureCanWriteOrRedirect({ locale, supabase, activeBabyId, userId });
  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - safeDurationMinutes * 60 * 1000);

  const { error } = await supabase.from("sleep_sessions").insert({
    baby_id: activeBabyId,
    logged_by: userId,
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
    duration_minutes: safeDurationMinutes,
    client_uuid: crypto.randomUUID(),
  });

  if (error) {
    redirect(`/${locale}/dashboard?error=sleep_failed`);
  }

  redirect(`/${locale}/dashboard?logged=sleep`);
}

export async function logDiaperAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const changeTypeRaw = formData.get("changeType")?.toString() ?? "wet";
  const changeType = ALLOWED_DIAPER_TYPES.has(changeTypeRaw)
    ? changeTypeRaw
    : "wet";
  const { supabase, userId, activeBabyId } = await getActiveBabyContext(locale);
  await ensureCanWriteOrRedirect({ locale, supabase, activeBabyId, userId });

  const { error } = await supabase.from("diaper_changes").insert({
    baby_id: activeBabyId,
    logged_by: userId,
    change_type: changeType,
    changed_at: new Date().toISOString(),
    client_uuid: crypto.randomUUID(),
  });

  if (error) {
    redirect(`/${locale}/dashboard?error=diaper_failed`);
  }

  redirect(`/${locale}/dashboard?logged=diaper`);
}
