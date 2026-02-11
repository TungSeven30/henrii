export type FeedingType = "breast" | "bottle" | "solid";
export type DiaperType = "wet" | "dirty" | "mixed";
export type EventTable = "feedings" | "sleep_sessions" | "diaper_changes";

export type QuickLogPayload =
  | {
      type: "feeding";
      feedingType: FeedingType;
      amountMl: number | null;
      happenedAt: string;
      clientUuid: string;
    }
  | {
      type: "sleep";
      minutes: number;
      startedAt: string;
      endedAt: string;
      clientUuid: string;
    }
  | {
      type: "diaper";
      diaperType: DiaperType;
      happenedAt: string;
      clientUuid: string;
    };

export type EventMutatePayload = {
  table: EventTable;
  id: string;
  operation: "update" | "delete";
  expectedUpdatedAt: string | null;
  patch?: Record<string, unknown>;
};

export type OfflineQueuePayload =
  | { kind: "log"; endpoint: "/api/events/log"; body: QuickLogPayload }
  | { kind: "mutate"; endpoint: "/api/events/mutate"; body: EventMutatePayload };

export function getDefaultPayload(type: QuickLogPayload["type"]): QuickLogPayload {
  const now = new Date();

  if (type === "feeding") {
    return {
      type,
      feedingType: "bottle",
      amountMl: 120,
      happenedAt: now.toISOString(),
      clientUuid: crypto.randomUUID(),
    };
  }

  if (type === "sleep") {
    const endedAt = now.toISOString();
    const startedAt = new Date(now.getTime() - 45 * 60 * 1000).toISOString();

    return {
      type,
      minutes: 45,
      startedAt,
      endedAt,
      clientUuid: crypto.randomUUID(),
    };
  }

  return {
    type,
    diaperType: "wet",
    happenedAt: now.toISOString(),
    clientUuid: crypto.randomUUID(),
  };
}
