"use server";

import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { canWriteToBaby } from "@/lib/billing/baby-plan";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";
import { buildVaccinationDueRows } from "@/lib/vaccinations/schedule-engine";

const ALLOWED_COUNTRY_CODES = new Set(["US", "GB", "VN"]);

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
    redirect(`/${locale}/health?error=read_only`);
  }
}

export async function seedVaccinationsAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const countryCodeRaw = formData.get("countryCode")?.toString() ?? "US";
  const countryCode = ALLOWED_COUNTRY_CODES.has(countryCodeRaw)
    ? countryCodeRaw
    : "US";
  const dateOfBirth = formData.get("dateOfBirth")?.toString() ?? "";

  if (!dateOfBirth) {
    redirect(`/${locale}/health?error=missing_dob`);
  }

  const { supabase, userId, activeBabyId } = await getActiveBabyContext(locale);
  await ensureCanWriteOrRedirect({ locale, supabase, activeBabyId, userId });
  const dueRows = await buildVaccinationDueRows(countryCode, dateOfBirth);

  const { error } = await supabase.from("vaccinations").upsert(
    dueRows.map((row) => ({
      baby_id: activeBabyId,
      logged_by: userId,
      vaccine_code: row.vaccine_code,
      vaccine_name: row.vaccine_name,
      due_date: row.due_date,
      client_uuid: crypto.randomUUID(),
      status: "pending",
    })),
    {
      onConflict: "baby_id,vaccine_code,due_date",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    redirect(`/${locale}/health?error=vaccination_seed_failed`);
  }

  redirect(`/${locale}/health?seeded=1`);
}

export async function markVaccinationCompletedAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const vaccinationId = formData.get("vaccinationId")?.toString() ?? "";

  if (!vaccinationId) {
    redirect(`/${locale}/health?error=missing_vaccination`);
  }

  const { supabase, activeBabyId, userId } = await getActiveBabyContext(locale);
  await ensureCanWriteOrRedirect({ locale, supabase, activeBabyId, userId });
  const { error } = await supabase
    .from("vaccinations")
    .update({
      status: "completed",
      completed_at: new Date().toISOString().slice(0, 10),
    })
    .eq("id", vaccinationId);

  if (error) {
    redirect(`/${locale}/health?error=vaccination_update_failed`);
  }

  redirect(`/${locale}/health?updated=1`);
}

export async function createAppointmentAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const title = formData.get("title")?.toString().trim() ?? "";
  const scheduledAt = formData.get("scheduledAt")?.toString() ?? "";
  const location = formData.get("location")?.toString().trim() ?? "";
  const notes = formData.get("notes")?.toString().trim() ?? "";

  if (!title || !scheduledAt) {
    redirect(`/${locale}/health?error=missing_appointment_fields`);
  }

  const parsedScheduledAt = new Date(scheduledAt);
  if (Number.isNaN(parsedScheduledAt.getTime())) {
    redirect(`/${locale}/health?error=invalid_appointment_datetime`);
  }

  const { supabase, userId, activeBabyId } = await getActiveBabyContext(locale);
  await ensureCanWriteOrRedirect({ locale, supabase, activeBabyId, userId });
  const { error } = await supabase.from("appointments").insert({
    baby_id: activeBabyId,
    created_by: userId,
    client_uuid: crypto.randomUUID(),
    title,
    scheduled_at: parsedScheduledAt.toISOString(),
    location: location || null,
    notes: notes || null,
  });

  if (error) {
    redirect(`/${locale}/health?error=appointment_create_failed`);
  }

  redirect(`/${locale}/health?appointment=1`);
}
