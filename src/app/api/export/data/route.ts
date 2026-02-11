import { NextResponse } from "next/server";
import { consumeScopedRateLimit } from "@/lib/rate-limit/consume";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ExportFormat = "json" | "csv";

function toCsvCell(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function parseFormat(value: string | null): ExportFormat {
  return value === "csv" ? "csv" : "json";
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await consumeScopedRateLimit({
    supabase,
    userId: user.id,
    scope: "export_data",
    limit: 20,
    windowMinutes: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Data export rate limit exceeded", resetAt: rateLimit.resetAt },
      { status: 429 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .single();

  if (!profile?.active_baby_id) {
    return NextResponse.json({ error: "No active baby selected" }, { status: 409 });
  }

  const babyId = profile.active_baby_id;
  const format = parseFormat(new URL(request.url).searchParams.get("format"));

  const [
    baby,
    feedings,
    sleepSessions,
    diapers,
    vaccinations,
    appointments,
    growth,
    milestones,
    caregivers,
    invites,
  ] = await Promise.all([
    supabase.from("babies").select("*").eq("id", babyId).single(),
    supabase.from("feedings").select("*").eq("baby_id", babyId).order("started_at", { ascending: true }),
    supabase.from("sleep_sessions").select("*").eq("baby_id", babyId).order("started_at", { ascending: true }),
    supabase.from("diaper_changes").select("*").eq("baby_id", babyId).order("changed_at", { ascending: true }),
    supabase.from("vaccinations").select("*").eq("baby_id", babyId).order("due_date", { ascending: true }),
    supabase.from("appointments").select("*").eq("baby_id", babyId).order("scheduled_at", { ascending: true }),
    supabase
      .from("growth_measurements")
      .select("*")
      .eq("baby_id", babyId)
      .order("measured_at", { ascending: true }),
    supabase
      .from("developmental_milestones")
      .select("*")
      .eq("baby_id", babyId)
      .order("created_at", { ascending: true }),
    supabase.from("caregivers").select("*").eq("baby_id", babyId).order("created_at", { ascending: true }),
    supabase.from("caregiver_invites").select("*").eq("baby_id", babyId).order("created_at", { ascending: true }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: {
      id: user.id,
      active_baby_id: babyId,
    },
    baby: baby.data,
    feedings: feedings.data ?? [],
    sleep_sessions: sleepSessions.data ?? [],
    diaper_changes: diapers.data ?? [],
    vaccinations: vaccinations.data ?? [],
    appointments: appointments.data ?? [],
    growth_measurements: growth.data ?? [],
    developmental_milestones: milestones.data ?? [],
    caregivers: caregivers.data ?? [],
    caregiver_invites: invites.data ?? [],
  };

  if (format === "json") {
    return NextResponse.json(payload, {
      headers: {
        "x-rate-limit-remaining": String(rateLimit.remaining),
        "x-rate-limit-reset": rateLimit.resetAt,
      },
    });
  }

  const timelineRows = [
    ...(feedings.data ?? []).map((row) => ({
      table: "feedings",
      happened_at: row.started_at,
      summary: `${row.feeding_type}${row.amount_ml ? ` ${row.amount_ml}ml` : ""}`,
    })),
    ...(sleepSessions.data ?? []).map((row) => ({
      table: "sleep_sessions",
      happened_at: row.started_at,
      summary: `${row.duration_minutes ?? 0}m`,
    })),
    ...(diapers.data ?? []).map((row) => ({
      table: "diaper_changes",
      happened_at: row.changed_at,
      summary: row.change_type,
    })),
    ...(vaccinations.data ?? []).map((row) => ({
      table: "vaccinations",
      happened_at: row.completed_at ?? row.due_date,
      summary: `${row.vaccine_name} (${row.status})`,
    })),
    ...(appointments.data ?? []).map((row) => ({
      table: "appointments",
      happened_at: row.scheduled_at,
      summary: `${row.title} (${row.status})`,
    })),
  ].sort((a, b) => new Date(a.happened_at).getTime() - new Date(b.happened_at).getTime());

  const header = ["table", "happened_at", "summary"];
  const lines = [header.map(toCsvCell).join(",")];
  for (const row of timelineRows) {
    lines.push([toCsvCell(row.table), toCsvCell(row.happened_at), toCsvCell(row.summary)].join(","));
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="henrii-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      "x-rate-limit-remaining": String(rateLimit.remaining),
      "x-rate-limit-reset": rateLimit.resetAt,
    },
  });
}
