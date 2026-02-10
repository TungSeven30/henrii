import type {
  DiaperType,
  EventMutatePayload,
  EventTable,
  FeedingType,
} from "./types";

type EventRow = {
  id: string;
  baby_id: string;
  updated_at: string;
  [key: string]: unknown;
};

type TableSpec = {
  happenedAtColumn: string;
};

type RowResponse = PromiseLike<{
  data: unknown;
  error: { message: string } | null;
}>;

type DeleteResponse = PromiseLike<{ error: { message: string } | null }>;

type SupabaseLike = {
  from: (table: string) => unknown;
};

const TABLES: Record<EventTable, TableSpec> = {
  feedings: { happenedAtColumn: "started_at" },
  sleep_sessions: { happenedAtColumn: "started_at" },
  diaper_changes: { happenedAtColumn: "changed_at" },
};

export type MutateEventResponse = {
  status: number;
  body: Record<string, unknown>;
};

function isEventTable(value: unknown): value is EventTable {
  return value === "feedings" || value === "sleep_sessions" || value === "diaper_changes";
}

function isFeedingType(value: unknown): value is FeedingType {
  return value === "breast" || value === "bottle" || value === "solid";
}

function isDiaperType(value: unknown): value is DiaperType {
  return value === "wet" || value === "dirty" || value === "mixed";
}

function parseIsoTimestamp(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export function parseEventMutatePayload(raw: unknown): EventMutatePayload | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const body = raw as Record<string, unknown>;
  if (!isEventTable(body.table)) {
    return null;
  }

  if (body.operation !== "update" && body.operation !== "delete") {
    return null;
  }

  if (typeof body.id !== "string" || body.id.length === 0) {
    return null;
  }

  const expectedUpdatedAt =
    body.expectedUpdatedAt === null || typeof body.expectedUpdatedAt === "string"
      ? body.expectedUpdatedAt
      : null;

  return {
    table: body.table,
    id: body.id,
    operation: body.operation,
    expectedUpdatedAt,
    patch: body.patch && typeof body.patch === "object" ? (body.patch as Record<string, unknown>) : {},
  };
}

function normalizePatch(table: EventTable, patch: Record<string, unknown> | undefined) {
  const data = patch ?? {};
  if (table === "feedings") {
    const normalized: Record<string, unknown> = {};
    if (isFeedingType(data.feeding_type)) {
      normalized.feeding_type = data.feeding_type;
    }
    if (typeof data.amount_ml === "number" && Number.isFinite(data.amount_ml)) {
      normalized.amount_ml = Math.max(0, Math.round(data.amount_ml));
    }
    if (typeof data.notes === "string") {
      normalized.notes = data.notes;
    }
    const startedAt = parseIsoTimestamp(data.started_at);
    if (startedAt) {
      normalized.started_at = startedAt;
    }
    return normalized;
  }

  if (table === "sleep_sessions") {
    const normalized: Record<string, unknown> = {};
    if (typeof data.duration_minutes === "number" && Number.isFinite(data.duration_minutes)) {
      normalized.duration_minutes = Math.max(0, Math.round(data.duration_minutes));
    }
    if (typeof data.notes === "string") {
      normalized.notes = data.notes;
    }
    const startedAt = parseIsoTimestamp(data.started_at);
    if (startedAt) {
      normalized.started_at = startedAt;
    }
    const endedAt = parseIsoTimestamp(data.ended_at);
    if (endedAt) {
      normalized.ended_at = endedAt;
    }
    return normalized;
  }

  const normalized: Record<string, unknown> = {};
  if (isDiaperType(data.change_type)) {
    normalized.change_type = data.change_type;
  }
  if (typeof data.notes === "string") {
    normalized.notes = data.notes;
  }
  const changedAt = parseIsoTimestamp(data.changed_at);
  if (changedAt) {
    normalized.changed_at = changedAt;
  }
  return normalized;
}

function isConflict(expectedUpdatedAt: string | null, actualUpdatedAt: string) {
  if (!expectedUpdatedAt) {
    return false;
  }

  const expected = parseIsoTimestamp(expectedUpdatedAt);
  const actual = parseIsoTimestamp(actualUpdatedAt);
  if (!expected || !actual) {
    return false;
  }

  return expected !== actual;
}

async function insertMutationConflict({
  supabase,
  babyId,
  table,
  eventId,
  operation,
  userId,
  expectedUpdatedAt,
  actualUpdatedAt,
  patch,
  currentSnapshot,
}: {
  supabase: SupabaseLike;
  babyId: string;
  table: EventTable;
  eventId: string;
  operation: "update" | "delete";
  userId: string;
  expectedUpdatedAt: string | null;
  actualUpdatedAt: string;
  patch: Record<string, unknown> | undefined;
  currentSnapshot: EventRow;
}) {
  const conflictQuery = supabase.from("mutation_conflicts") as {
    insert: (values: Record<string, unknown>) => PromiseLike<unknown>;
  };

  await conflictQuery.insert({
    baby_id: babyId,
    event_table: table,
    event_id: eventId,
    operation,
    reported_by: userId,
    expected_updated_at: expectedUpdatedAt,
    actual_updated_at: actualUpdatedAt,
    attempted_patch: patch ?? null,
    current_snapshot: currentSnapshot,
  });
}

export async function mutateEvent({
  supabase,
  payload,
  userId,
  activeBabyId,
}: {
  supabase: SupabaseLike;
  payload: EventMutatePayload;
  userId: string;
  activeBabyId: string;
}): Promise<MutateEventResponse> {
  const tableQuery = supabase.from(payload.table) as {
    select: (columns: string) => {
      eq: (column: string, value: unknown) => {
        eq: (column: string, value: unknown) => {
          single: () => RowResponse;
        };
      };
    };
    delete: () => {
      eq: (column: string, value: unknown) => DeleteResponse;
    };
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: unknown) => {
        select: (columns: string) => {
          single: () => RowResponse;
        };
      };
    };
  };

  const tableSpec = TABLES[payload.table];
  const rowResponse = await tableQuery
    .select("*")
    .eq("id", payload.id)
    .eq("baby_id", activeBabyId)
    .single();

  if (rowResponse.error || !rowResponse.data) {
    return { status: 404, body: { error: "Event not found" } };
  }

  const currentRow = rowResponse.data as EventRow;
  if (isConflict(payload.expectedUpdatedAt, currentRow.updated_at)) {
    await insertMutationConflict({
      supabase,
      babyId: activeBabyId,
      table: payload.table,
      eventId: payload.id,
      operation: payload.operation,
      userId,
      expectedUpdatedAt: payload.expectedUpdatedAt,
      actualUpdatedAt: currentRow.updated_at,
      patch: payload.patch,
      currentSnapshot: currentRow,
    });

    return {
      status: 409,
      body: {
        error: "Conflict detected: expected_updated_at is stale",
        conflict: true,
      },
    };
  }

  if (payload.operation === "delete") {
    const { error } = await tableQuery.delete().eq("id", payload.id);
    if (error) {
      return { status: 400, body: { error: error.message } };
    }

    return {
      status: 200,
      body: {
        ok: true,
        operation: "delete",
        event_table: payload.table,
        event_id: payload.id,
        happened_at: currentRow[tableSpec.happenedAtColumn] ?? null,
      },
    };
  }

  const normalizedPatch = normalizePatch(payload.table, payload.patch);
  if (Object.keys(normalizedPatch).length === 0) {
    return { status: 400, body: { error: "No valid update fields provided" } };
  }

  const updatedQuery = supabase.from(payload.table) as {
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: unknown) => {
        select: (columns: string) => {
          single: () => RowResponse;
        };
      };
    };
  };

  const updateResponse = await updatedQuery
    .update(normalizedPatch)
    .eq("id", payload.id)
    .select("*")
    .single();

  const { data: updatedRow, error: updateError } = updateResponse;

  if (updateError || !updatedRow) {
    return { status: 400, body: { error: updateError?.message ?? "Update failed" } };
  }

  const row = updatedRow as EventRow;
  return {
    status: 200,
    body: {
      ok: true,
      operation: "update",
      event_table: payload.table,
      event_id: payload.id,
      updated_at: row.updated_at,
      happened_at: row[tableSpec.happenedAtColumn] ?? null,
    },
  };
}
