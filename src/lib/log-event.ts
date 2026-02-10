import { createClient } from "@/lib/supabase/client";
import { enqueueEvent } from "@/lib/offline/queue-db";
import type { OfflineQueuePayload, QuickLogPayload } from "@/lib/events/types";

type LogEventInput = {
  tableName: string;
  payload: Record<string, unknown>;
};

function normalizeInsertPayload(tableName: string, payload: Record<string, unknown>) {
  if (tableName === "feedings") {
    return {
      baby_id: payload.baby_id,
      logged_by: payload.logged_by,
      feeding_type: payload.type ?? payload.feeding_type ?? "bottle",
      amount_ml: payload.amount_ml ?? null,
      started_at: payload.started_at ?? new Date().toISOString(),
      notes: payload.notes ?? null,
      client_uuid: crypto.randomUUID(),
    };
  }

  if (tableName === "sleep_sessions") {
    return {
      baby_id: payload.baby_id,
      logged_by: payload.logged_by,
      started_at: payload.started_at ?? new Date().toISOString(),
      ended_at: payload.ended_at ?? null,
      duration_minutes: payload.duration_minutes ?? null,
      notes: payload.notes ?? null,
      client_uuid: crypto.randomUUID(),
    };
  }

  if (tableName === "diaper_changes") {
    const rawType = String(payload.type ?? payload.change_type ?? "wet");
    const mappedType = rawType === "both" ? "mixed" : rawType;

    return {
      baby_id: payload.baby_id,
      logged_by: payload.logged_by,
      change_type: mappedType,
      changed_at: payload.changed_at ?? new Date().toISOString(),
      notes: payload.notes ?? null,
      client_uuid: crypto.randomUUID(),
    };
  }

  if (tableName === "growth_measurements") {
    return {
      baby_id: payload.baby_id,
      logged_by: payload.logged_by,
      measured_at: payload.measured_at,
      weight_kg:
        typeof payload.weight_grams === "number"
          ? payload.weight_grams / 1000
          : payload.weight_kg ?? null,
      length_cm: payload.length_cm ?? null,
      head_circumference_cm: payload.head_circumference_cm ?? null,
      weight_percentile: payload.weight_percentile ?? null,
      length_percentile: payload.length_percentile ?? null,
      head_percentile: payload.head_percentile ?? null,
      notes: payload.notes ?? null,
      client_uuid: crypto.randomUUID(),
    };
  }

  return {
    ...payload,
    client_uuid: payload.client_uuid ?? crypto.randomUUID(),
  };
}

async function enqueueQuickLog(payload: QuickLogPayload) {
  const queuePayload: OfflineQueuePayload = {
    endpoint: "/api/events/log",
    body: payload,
  };
  await enqueueEvent(queuePayload);
}

function toQuickLogPayload(
  tableName: string,
  payload: Record<string, unknown>,
): QuickLogPayload | null {
  if (tableName === "feedings") {
    const rawType = String(payload.type ?? payload.feeding_type ?? "bottle");
    const feedingType: Extract<QuickLogPayload, { type: "feeding" }>["feedingType"] =
      rawType === "breast" || rawType === "solid" ? rawType : "bottle";

    return {
      type: "feeding",
      feedingType,
      amountMl: typeof payload.amount_ml === "number" ? payload.amount_ml : null,
      happenedAt:
        typeof payload.started_at === "string"
          ? payload.started_at
          : new Date().toISOString(),
      clientUuid: crypto.randomUUID(),
    };
  }

  if (tableName === "sleep_sessions") {
    const startedAt =
      typeof payload.started_at === "string" ? payload.started_at : new Date().toISOString();
    const endedAt = typeof payload.ended_at === "string" ? payload.ended_at : new Date().toISOString();

    return {
      type: "sleep",
      startedAt,
      endedAt,
      minutes:
        typeof payload.duration_minutes === "number"
          ? payload.duration_minutes
          : Math.max(
              0,
              Math.round(
                (new Date(endedAt).getTime() - new Date(startedAt).getTime()) /
                  (60 * 1000),
              ),
            ),
      clientUuid: crypto.randomUUID(),
    };
  }

  if (tableName === "diaper_changes") {
    const rawType = String(payload.type ?? payload.change_type ?? "wet");
    const diaperType: Extract<QuickLogPayload, { type: "diaper" }>["diaperType"] =
      rawType === "dirty" || rawType === "mixed" ? rawType : "wet";

    return {
      type: "diaper",
      diaperType: rawType === "both" ? "mixed" : diaperType,
      happenedAt:
        typeof payload.changed_at === "string"
          ? payload.changed_at
          : new Date().toISOString(),
      clientUuid: crypto.randomUUID(),
    };
  }

  return null;
}

export async function logEvent({ tableName, payload }: LogEventInput): Promise<{ success: boolean; offline: boolean }> {
  const normalized = normalizeInsertPayload(tableName, payload);

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const quickLogPayload = toQuickLogPayload(tableName, payload);
    if (quickLogPayload) {
      await enqueueQuickLog(quickLogPayload);
      return { success: true, offline: true };
    }

    return { success: false, offline: true };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from(tableName).insert(normalized);
    if (error) {
      throw error;
    }

    return { success: true, offline: false };
  } catch {
    const quickLogPayload = toQuickLogPayload(tableName, payload);
    if (quickLogPayload) {
      await enqueueQuickLog(quickLogPayload);
      return { success: true, offline: true };
    }

    return { success: false, offline: false };
  }
}
