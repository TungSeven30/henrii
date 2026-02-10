import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { NextResponse } from "next/server";
import { getBabyPremiumStatus } from "@/lib/billing/baby-plan";
import { PediatricReportDocument } from "@/lib/pdf/pediatric-report-document";
import { consumeScopedRateLimit } from "@/lib/rate-limit/consume";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type DateRange = {
  start: string;
  end: string;
};

function parseDateRange(raw: unknown): DateRange | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const body = raw as Record<string, unknown>;
  if (typeof body.start !== "string" || typeof body.end !== "string") {
    return null;
  }

  const start = new Date(body.start);
  const end = new Date(body.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return null;
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await consumeScopedRateLimit({
    supabase: supabase as unknown as Parameters<typeof consumeScopedRateLimit>[0]["supabase"],
    userId: user.id,
    scope: "export_pdf",
    limit: 10,
    windowMinutes: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "PDF export rate limit exceeded", resetAt: rateLimit.resetAt },
      { status: 429 },
    );
  }

  const dateRange = parseDateRange(await request.json().catch(() => null));
  if (!dateRange) {
    return NextResponse.json({ error: "Invalid date range payload" }, { status: 400 });
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
  const plan = await getBabyPremiumStatus({
    supabase: supabase as unknown as Parameters<typeof getBabyPremiumStatus>[0]["supabase"],
    babyId,
  });
  if (!plan.premium) {
    return NextResponse.json(
      { error: "PDF export requires a premium subscription." },
      { status: 402 },
    );
  }

  const [baby, feedings, sleepSessions, diapers, vaccinations, appointments, growthRows] =
    await Promise.all([
      supabase.from("babies").select("name").eq("id", babyId).single(),
      supabase
        .from("feedings")
        .select("started_at, feeding_type, amount_ml")
        .eq("baby_id", babyId)
        .gte("started_at", dateRange.start)
        .lte("started_at", dateRange.end)
        .order("started_at", { ascending: true }),
      supabase
        .from("sleep_sessions")
        .select("started_at, duration_minutes")
        .eq("baby_id", babyId)
        .gte("started_at", dateRange.start)
        .lte("started_at", dateRange.end)
        .order("started_at", { ascending: true }),
      supabase
        .from("diaper_changes")
        .select("changed_at, change_type")
        .eq("baby_id", babyId)
        .gte("changed_at", dateRange.start)
        .lte("changed_at", dateRange.end)
        .order("changed_at", { ascending: true }),
      supabase
        .from("vaccinations")
        .select("vaccine_name, completed_at, status")
        .eq("baby_id", babyId)
        .gte("due_date", dateRange.start.slice(0, 10))
        .lte("due_date", dateRange.end.slice(0, 10)),
      supabase
        .from("appointments")
        .select("title, scheduled_at, status")
        .eq("baby_id", babyId)
        .gte("scheduled_at", dateRange.start)
        .lte("scheduled_at", dateRange.end),
      supabase
        .from("growth_measurements")
        .select("measured_at, weight_percentile, length_percentile, head_percentile")
        .eq("baby_id", babyId)
        .gte("measured_at", dateRange.start.slice(0, 10))
        .lte("measured_at", dateRange.end.slice(0, 10))
        .order("measured_at", { ascending: true })
        .limit(30),
    ]);

  const growthTrend = growthRows.data ?? [];
  const latestGrowth = growthTrend[growthTrend.length - 1];
  const highlights: string[] = [];
  if (latestGrowth?.weight_percentile) {
    highlights.push(`Latest weight percentile: ${Number(latestGrowth.weight_percentile).toFixed(1)}%`);
  }
  if (latestGrowth?.length_percentile) {
    highlights.push(`Latest length percentile: ${Number(latestGrowth.length_percentile).toFixed(1)}%`);
  }
  if (latestGrowth?.head_percentile) {
    highlights.push(`Latest head percentile: ${Number(latestGrowth.head_percentile).toFixed(1)}%`);
  }

  const completedVaccinations = (vaccinations.data ?? []).filter(
    (row) => row.status === "completed",
  ).length;

  const reportDocument = React.createElement(PediatricReportDocument, {
    babyName: baby.data?.name ?? "Unknown",
    range: dateRange,
    summary: {
      feedings: feedings.data?.length ?? 0,
      sleepSessions: sleepSessions.data?.length ?? 0,
      diapers: diapers.data?.length ?? 0,
      vaccinationsCompleted: completedVaccinations,
      appointments: appointments.data?.length ?? 0,
    },
    keyRows: highlights,
    growthTrend,
  }) as unknown as React.ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(reportDocument);
  const bytes = new Uint8Array(buffer);

  return new NextResponse(bytes, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="henrii-report-${dateRange.start.slice(0, 10)}-${dateRange.end.slice(0, 10)}.pdf"`,
      "x-rate-limit-remaining": String(rateLimit.remaining),
      "x-rate-limit-reset": rateLimit.resetAt,
    },
  });
}
