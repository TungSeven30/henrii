import { NextResponse } from "next/server";
import {
  isDiaperType,
  isFeedingType,
  parseIsoTimestamp,
} from "@/lib/events/parse";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DiaperType, FeedingType } from "@/lib/events/types";

type ParsedLogPayload =
  | {
      type: "feeding";
      feedingType: FeedingType;
      amountMl: number | null;
      happenedAt: string;
      notes: string | null;
      clientUuid: string;
    }
  | {
      type: "sleep";
      minutes: number;
      startedAt: string;
      endedAt: string;
      notes: string | null;
      clientUuid: string;
    }
  | {
      type: "diaper";
      diaperType: DiaperType;
      happenedAt: string;
      notes: string | null;
      clientUuid: string;
    };

function parseOptionalNotes(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parsePayload(rawBody: unknown): ParsedLogPayload | null {
  if (!rawBody || typeof rawBody !== "object") {
    return null;
  }

  const body = rawBody as Record<string, unknown>;
  const clientUuid =
    typeof body.clientUuid === "string" && body.clientUuid.length > 0
      ? body.clientUuid
      : crypto.randomUUID();

  if (body.type === "feeding") {
    const feedingType =
      typeof body.feedingType === "string" && isFeedingType(body.feedingType)
        ? body.feedingType
        : "bottle";
    const amountMl =
      typeof body.amountMl === "number" && Number.isFinite(body.amountMl)
        ? Math.max(0, Math.round(body.amountMl))
        : null;
    const happenedAt = parseIsoTimestamp(body.happenedAt) ?? new Date().toISOString();

    return {
      type: "feeding",
      feedingType,
      amountMl,
      happenedAt,
      notes: parseOptionalNotes(body.notes),
      clientUuid,
    };
  }

  if (body.type === "sleep") {
    const providedMinutes =
      typeof body.minutes === "number" && Number.isFinite(body.minutes)
        ? Math.max(0, Math.round(body.minutes))
        : 0;
    const endedAt = parseIsoTimestamp(body.endedAt) ?? new Date().toISOString();
    const startedAt =
      parseIsoTimestamp(body.startedAt) ??
      new Date(new Date(endedAt).getTime() - providedMinutes * 60 * 1000).toISOString();
    const minutes = Math.max(
      0,
      Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / (60 * 1000)),
    );

    return {
      type: "sleep",
      minutes,
      startedAt,
      endedAt,
      notes: parseOptionalNotes(body.notes),
      clientUuid,
    };
  }

  if (body.type === "diaper") {
    const diaperType =
      typeof body.diaperType === "string" && isDiaperType(body.diaperType)
        ? body.diaperType
        : "wet";
    const happenedAt = parseIsoTimestamp(body.happenedAt) ?? new Date().toISOString();

    return {
      type: "diaper",
      diaperType,
      happenedAt,
      notes: parseOptionalNotes(body.notes),
      clientUuid,
    };
  }

  return null;
}

export async function POST(request: Request) {
  const payload = parsePayload(await request.json().catch(() => null));

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active_baby_id) {
    return NextResponse.json({ error: "No active baby selected" }, { status: 409 });
  }

  if (payload.type === "feeding") {
    const { error } = await supabase.from("feedings").insert({
      baby_id: profile.active_baby_id,
      logged_by: user.id,
      feeding_type: payload.feedingType,
      amount_ml: payload.amountMl,
      started_at: payload.happenedAt,
      notes: payload.notes,
      client_uuid: payload.clientUuid,
    });

    if (error) {
      console.error("[events/log] feed insert failed", {
        userId: user.id,
        babyId: profile.active_baby_id,
        code: error.code,
        message: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  if (payload.type === "sleep") {
    const { error } = await supabase.from("sleep_sessions").insert({
      baby_id: profile.active_baby_id,
      logged_by: user.id,
      started_at: payload.startedAt,
      ended_at: payload.endedAt,
      duration_minutes: payload.minutes,
      notes: payload.notes,
      client_uuid: payload.clientUuid,
    });

    if (error) {
      console.error("[events/log] sleep insert failed", {
        userId: user.id,
        babyId: profile.active_baby_id,
        code: error.code,
        message: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  if (payload.type === "diaper") {
    const { error } = await supabase.from("diaper_changes").insert({
      baby_id: profile.active_baby_id,
      logged_by: user.id,
      change_type: payload.diaperType,
      changed_at: payload.happenedAt,
      notes: payload.notes,
      client_uuid: payload.clientUuid,
    });

    if (error) {
      console.error("[events/log] diaper insert failed", {
        userId: user.id,
        babyId: profile.active_baby_id,
        code: error.code,
        message: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
