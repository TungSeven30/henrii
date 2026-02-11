"use server";

import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { canWriteToBaby } from "@/lib/billing/baby-plan";
import {
  calculateGrowthPercentileFromDates,
  type GrowthSex,
} from "@/lib/growth/percentile";
import { whoGrowthTables } from "@/lib/growth/who-growth-tables";
import { defaultMilestoneDefinitions } from "@/lib/milestones/definitions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";
import { inToCm, lbToKg, parseUnitSystem } from "@/lib/units/system";

const ALLOWED_MILESTONE_STATUSES = new Set(["not_started", "emerging", "achieved"]);

function getSafeLocale(rawLocale: string | null): string {
  if (rawLocale && routing.locales.includes(rawLocale as "en" | "vi")) {
    return rawLocale;
  }

  return routing.defaultLocale;
}

function parsePositiveValue(raw: FormDataEntryValue | null) {
  if (!raw) {
    return null;
  }

  const parsed = Number(raw.toString());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function isValidIsoDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function mapBabySexToGrowthSex(sex: string | null | undefined): GrowthSex {
  if (sex === "male") {
    return "male";
  }

  return "female";
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
    supabase,
    babyId: activeBabyId,
    userId,
  });

  if (!canWrite) {
    redirect(`/${locale}/growth?error=read_only`);
  }
}

export async function logGrowthMeasurementAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const measuredAt = formData.get("measuredAt")?.toString() ?? "";
  const notes = formData.get("notes")?.toString().trim() ?? "";
  const unitSystem = parseUnitSystem(formData.get("unitSystem")?.toString() ?? null);
  const rawWeight = parsePositiveValue(formData.get("weight"));
  const rawLength = parsePositiveValue(formData.get("length"));
  const rawHeadCircumference = parsePositiveValue(formData.get("headCircumference"));
  const weightKg = rawWeight ? (unitSystem === "imperial" ? lbToKg(rawWeight) : rawWeight) : null;
  const lengthCm = rawLength ? (unitSystem === "imperial" ? inToCm(rawLength) : rawLength) : null;
  const headCircumferenceCm = rawHeadCircumference
    ? unitSystem === "imperial"
      ? inToCm(rawHeadCircumference)
      : rawHeadCircumference
    : null;

  if (!measuredAt || (!weightKg && !lengthCm && !headCircumferenceCm)) {
    redirect(`/${locale}/growth?error=missing_measurement`);
  }

  if (!isValidIsoDateInput(measuredAt)) {
    redirect(`/${locale}/growth?error=invalid_measured_at`);
  }

  const { supabase, userId, activeBabyId } = await getActiveBabyContext(locale);
  await ensureCanWriteOrRedirect({ locale, supabase, activeBabyId, userId });
  const { data: baby } = await supabase
    .from("babies")
    .select("date_of_birth, sex")
    .eq("id", activeBabyId)
    .single();

  if (!baby) {
    redirect(`/${locale}/growth?error=baby_not_found`);
  }

  const today = new Date().toISOString().slice(0, 10);
  if (measuredAt > today) {
    redirect(`/${locale}/growth?error=future_measurement`);
  }

  if (measuredAt < baby.date_of_birth) {
    redirect(`/${locale}/growth?error=before_birth`);
  }

  const growthSex = mapBabySexToGrowthSex(baby.sex);
  const measuredAtIso = `${measuredAt}T00:00:00.000Z`;
  const dateOfBirthIso = `${baby.date_of_birth}T00:00:00.000Z`;

  const weightPercentile = weightKg
    ? calculateGrowthPercentileFromDates({
        tables: whoGrowthTables,
        metric: "weight_for_age",
        sex: growthSex,
        dateOfBirthIso,
        measuredAtIso,
        measurement: weightKg,
      }).percentile
    : null;
  const lengthPercentile = lengthCm
    ? calculateGrowthPercentileFromDates({
        tables: whoGrowthTables,
        metric: "length_for_age",
        sex: growthSex,
        dateOfBirthIso,
        measuredAtIso,
        measurement: lengthCm,
      }).percentile
    : null;
  const headPercentile = headCircumferenceCm
    ? calculateGrowthPercentileFromDates({
        tables: whoGrowthTables,
        metric: "head_circumference_for_age",
        sex: growthSex,
        dateOfBirthIso,
        measuredAtIso,
        measurement: headCircumferenceCm,
      }).percentile
    : null;

  const insertResult = await supabase.from("growth_measurements").insert({
    baby_id: activeBabyId,
    logged_by: userId,
    client_uuid: crypto.randomUUID(),
    measured_at: measuredAt,
    weight_kg: weightKg,
    length_cm: lengthCm,
    head_circumference_cm: headCircumferenceCm,
    weight_percentile: weightPercentile,
    length_percentile: lengthPercentile,
    head_percentile: headPercentile,
    notes: notes || null,
  });

  if (insertResult.error) {
    redirect(`/${locale}/growth?error=growth_insert_failed`);
  }

  redirect(`/${locale}/growth?logged=1`);
}

export async function seedMilestonesAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const { supabase, userId, activeBabyId } = await getActiveBabyContext(locale);
  await ensureCanWriteOrRedirect({ locale, supabase, activeBabyId, userId });

  const admin = createSupabaseAdminClient();
  const definitionClient = admin ?? supabase;
  const definitionResult = await definitionClient.from("milestone_definitions").upsert(
    defaultMilestoneDefinitions,
    {
      onConflict: "key",
      ignoreDuplicates: false,
    },
  );

  if (definitionResult.error) {
    redirect(`/${locale}/growth?error=seed_definitions_failed`);
  }

  const rows = defaultMilestoneDefinitions.map((definition) => ({
    baby_id: activeBabyId,
    milestone_key: definition.key,
    logged_by: userId,
    status: "not_started",
  }));

  const milestonesResult = await supabase.from("developmental_milestones").upsert(rows, {
    onConflict: "baby_id,milestone_key",
    ignoreDuplicates: true,
  });

  if (milestonesResult.error) {
    redirect(`/${locale}/growth?error=seed_milestones_failed`);
  }

  redirect(`/${locale}/growth?seeded=1`);
}

export async function updateMilestoneStatusAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const milestoneId = formData.get("milestoneId")?.toString() ?? "";
  const statusRaw = formData.get("status")?.toString() ?? "not_started";
  const status = ALLOWED_MILESTONE_STATUSES.has(statusRaw)
    ? statusRaw
    : "not_started";
  const achievedAtRaw = formData.get("achievedAt")?.toString() ?? "";
  const notes = formData.get("notes")?.toString().trim() ?? "";

  if (!milestoneId) {
    redirect(`/${locale}/growth?error=missing_milestone`);
  }

  const achievedAt =
    status === "achieved"
      ? achievedAtRaw || new Date().toISOString().slice(0, 10)
      : null;

  const { supabase, activeBabyId, userId } = await getActiveBabyContext(locale);
  await ensureCanWriteOrRedirect({ locale, supabase, activeBabyId, userId });
  const updateResult = await supabase
    .from("developmental_milestones")
    .update({
      status,
      achieved_at: achievedAt,
      notes: notes || null,
    })
    .eq("id", milestoneId);

  if (updateResult.error) {
    redirect(`/${locale}/growth?error=milestone_update_failed`);
  }

  redirect(`/${locale}/growth?updated=1`);
}
