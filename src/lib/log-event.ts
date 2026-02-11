import { createClient } from "@/lib/supabase/client";
import { normalizeDiaperType } from "@/lib/events/parse";
import { enqueueEvent } from "@/lib/offline/queue-db";
import type { OfflineQueuePayload, QuickLogPayload } from "@/lib/events/types";
import type { Database } from "@/types/database";

type LogEventInput = {
  tableName: string;
  payload: Record<string, unknown>;
};

export type LogEventResult = {
  success: boolean;
  offline: boolean;
  error?: string;
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
    const mappedType = normalizeDiaperType(rawType);

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
    kind: "log",
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
      normalizeDiaperType(rawType);

    return {
      type: "diaper",
      diaperType,
      happenedAt:
        typeof payload.changed_at === "string"
          ? payload.changed_at
          : new Date().toISOString(),
      clientUuid: crypto.randomUUID(),
    };
  }

  return null;
}

function toEventApiPayload(tableName: string, payload: Record<string, unknown>) {
  if (tableName === "feedings") {
    const rawType = String(payload.type ?? payload.feeding_type ?? "bottle");
    const feedingType = rawType === "breast" || rawType === "solid" ? rawType : "bottle";
    return {
      type: "feeding" as const,
      feedingType,
      amountMl: typeof payload.amount_ml === "number" ? payload.amount_ml : null,
      happenedAt:
        typeof payload.started_at === "string"
          ? payload.started_at
          : new Date().toISOString(),
      notes: typeof payload.notes === "string" ? payload.notes : null,
      clientUuid:
        typeof payload.client_uuid === "string" && payload.client_uuid.length > 0
          ? payload.client_uuid
          : crypto.randomUUID(),
    };
  }

  if (tableName === "sleep_sessions") {
    const startedAt =
      typeof payload.started_at === "string"
        ? payload.started_at
        : new Date().toISOString();
    const endedAt =
      typeof payload.ended_at === "string"
        ? payload.ended_at
        : new Date().toISOString();
    const minutes =
      typeof payload.duration_minutes === "number"
        ? payload.duration_minutes
        : Math.max(
            0,
            Math.round(
              (new Date(endedAt).getTime() - new Date(startedAt).getTime()) /
                (60 * 1000),
            ),
          );

    return {
      type: "sleep" as const,
      startedAt,
      endedAt,
      minutes,
      notes: typeof payload.notes === "string" ? payload.notes : null,
      clientUuid:
        typeof payload.client_uuid === "string" && payload.client_uuid.length > 0
          ? payload.client_uuid
          : crypto.randomUUID(),
    };
  }

  if (tableName === "diaper_changes") {
    const rawType = String(payload.type ?? payload.change_type ?? "wet");
    const diaperType = normalizeDiaperType(rawType);

    return {
      type: "diaper" as const,
      diaperType,
      happenedAt:
        typeof payload.changed_at === "string"
          ? payload.changed_at
          : new Date().toISOString(),
      notes: typeof payload.notes === "string" ? payload.notes : null,
      clientUuid:
        typeof payload.client_uuid === "string" && payload.client_uuid.length > 0
          ? payload.client_uuid
          : crypto.randomUUID(),
    };
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Unable to save event";
}

function shouldQueueAfterFailure(error: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return true;
  }

  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection") ||
    message.includes("timed out")
  );
}

export async function logEvent({ tableName, payload }: LogEventInput): Promise<LogEventResult> {
  const apiPayload = toEventApiPayload(tableName, payload);

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const quickLogPayload = toQuickLogPayload(tableName, payload);
    if (quickLogPayload) {
      await enqueueQuickLog(quickLogPayload);
      return { success: true, offline: true };
    }

    return { success: false, offline: true, error: "Offline queue unavailable for this event." };
  }

  try {
    if (apiPayload) {
      const response = await fetch("/api/events/log", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        let errorMessage = "Unable to save event";
        try {
          const data = (await response.json()) as { error?: unknown };
          if (typeof data.error === "string" && data.error.trim().length > 0) {
            errorMessage = data.error;
          }
        } catch {
          // Ignore JSON parsing failures.
        }
        return { success: false, offline: false, error: errorMessage };
      }

      return { success: true, offline: false };
    }

    const normalized = normalizeInsertPayload(tableName, payload);
    const supabase = createClient();
    const safeTableName = tableName as keyof Database["public"]["Tables"];
    const { error } = await supabase.from(safeTableName).insert(normalized as never);
    if (error) {
      if (shouldQueueAfterFailure(error)) {
        const quickLogPayload = toQuickLogPayload(tableName, payload);
        if (quickLogPayload) {
          await enqueueQuickLog(quickLogPayload);
          return { success: true, offline: true };
        }
      }

      return { success: false, offline: false, error: error.message };
    }

    return { success: true, offline: false };
  } catch (error) {
    if (shouldQueueAfterFailure(error)) {
      const quickLogPayload = toQuickLogPayload(tableName, payload);
      if (quickLogPayload) {
        await enqueueQuickLog(quickLogPayload);
        return { success: true, offline: true };
      }
    }

    return { success: false, offline: false, error: getErrorMessage(error) };
  }
}
