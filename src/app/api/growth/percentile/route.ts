import { NextResponse } from "next/server";
import {
  calculateGrowthPercentileFromDates,
  type GrowthMetric,
  type GrowthSex,
} from "@/lib/growth/percentile";
import { whoGrowthTables } from "@/lib/growth/who-growth-tables";

type RequestBody = {
  metric?: GrowthMetric;
  sex?: GrowthSex;
  dateOfBirth?: string;
  measuredAt?: string;
  measurement?: number;
};

function isMetric(value: unknown): value is GrowthMetric {
  return (
    value === "weight_for_age" ||
    value === "length_for_age" ||
    value === "head_circumference_for_age"
  );
}

function isSex(value: unknown): value is GrowthSex {
  return value === "male" || value === "female";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RequestBody | null;
  if (!body || !isMetric(body.metric) || !isSex(body.sex)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (
    typeof body.dateOfBirth !== "string" ||
    typeof body.measuredAt !== "string" ||
    typeof body.measurement !== "number"
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const result = calculateGrowthPercentileFromDates({
      tables: whoGrowthTables,
      metric: body.metric,
      sex: body.sex,
      dateOfBirthIso: `${body.dateOfBirth}T00:00:00.000Z`,
      measuredAtIso: `${body.measuredAt}T00:00:00.000Z`,
      measurement: body.measurement,
    });

    return NextResponse.json({
      ok: true,
      metric: body.metric,
      sex: body.sex,
      ageDays: result.ageDays,
      zScore: result.zScore,
      percentile: result.percentile,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to calculate percentile" },
      { status: 400 },
    );
  }
}
