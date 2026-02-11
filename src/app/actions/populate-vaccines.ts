"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildVaccinationDueRows } from "@/lib/vaccinations/schedule-engine";

export async function populateVaccinesAction(
  babyId: string,
  dateOfBirth: string,
  countryCode: string,
) {
  if (!babyId || !dateOfBirth) {
    return { ok: false };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }
  const schedule = await buildVaccinationDueRows(countryCode, dateOfBirth);

  if (!schedule.length) {
    return { ok: true, inserted: 0 };
  }

  const rows = schedule.map((item) => ({
    baby_id: babyId,
    logged_by: user.id,
    client_uuid: crypto.randomUUID(),
    vaccine_code: item.vaccine_code,
    vaccine_name: item.vaccine_name,
    due_date: item.due_date,
    status: "pending" as const,
  }));

  const { error } = await supabase
    .from("vaccinations")
    .upsert(rows, { onConflict: "baby_id,vaccine_code,due_date", ignoreDuplicates: true });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, inserted: rows.length };
}
