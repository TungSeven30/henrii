"use server";

import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";

type ResolutionAction = "keep_both" | "dismiss";

function getSafeLocale(rawLocale: string | null): string {
  if (rawLocale && routing.locales.includes(rawLocale as "en" | "vi")) {
    return rawLocale;
  }

  return routing.defaultLocale;
}

function resolveStatus(action: ResolutionAction) {
  return action === "keep_both" ? "resolved_keep_both" : "dismissed";
}

export async function resolveConflictAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const conflictId = formData.get("conflictId")?.toString() ?? "";
  const action = (formData.get("action")?.toString() ?? "keep_both") as ResolutionAction;

  if (!conflictId || (action !== "keep_both" && action !== "dismiss")) {
    redirect(`/${locale}/conflicts?error=invalid_resolution`);
  }

  const { supabase, activeBabyId, userId } = await getActiveBabyContext(locale);
  const { error } = await supabase
    .from("event_conflicts")
    .update({
      status: resolveStatus(action),
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", conflictId)
    .eq("baby_id", activeBabyId)
    .eq("status", "open");

  if (error) {
    redirect(`/${locale}/conflicts?error=resolve_failed`);
  }

  redirect(`/${locale}/conflicts?resolved=1`);
}

export async function resolveMutationConflictAction(formData: FormData) {
  const locale = getSafeLocale(formData.get("locale")?.toString() ?? null);
  const conflictId = formData.get("conflictId")?.toString() ?? "";

  if (!conflictId) {
    redirect(`/${locale}/conflicts?error=invalid_mutation_resolution`);
  }

  const { supabase, activeBabyId, userId } = await getActiveBabyContext(locale);
  const { error } = await supabase
    .from("mutation_conflicts")
    .update({
      status: "resolved",
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", conflictId)
    .eq("baby_id", activeBabyId)
    .eq("status", "open");

  if (error) {
    redirect(`/${locale}/conflicts?error=mutation_resolve_failed`);
  }

  redirect(`/${locale}/conflicts?resolved=1`);
}
