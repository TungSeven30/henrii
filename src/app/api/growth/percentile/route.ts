import { NextResponse } from "next/server";
import {
  calculateGrowthPercentile,
  calculateGrowthPercentileFromDates,
  type GrowthMetric,
  type GrowthSex,
} from "@/lib/growth/percentile";
import { whoGrowthTables } from "@/lib/growth/who-growth-tables";

const METRIC_MAP = {
  weight_for_age: "weight_for_age",
  "weight-for-age": "weight_for_age",
  length_for_age: "length_for_age",
  "length-for-age": "length_for_age",
  head_circumference_for_age: "head_circumference_for_age",
  "head-for-age": "head_circumference_for_age",
} as const satisfies Record<string, GrowthMetric>;

type MetricBody = keyof typeof METRIC_MAP;

type RequestBody = {
  metric?: MetricBody;
  sex?: GrowthSex;
  dateOfBirth?: string;
  measuredAt?: string;
  measurement?: number;
  ageDays?: number;
  value?: number;
};

function isMetric(value: unknown): value is MetricBody {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(METRIC_MAP, value);
}

function normalizeMetric(value: MetricBody): GrowthMetric {
  return METRIC_MAP[value];
}

function isSex(value: unknown): value is GrowthSex {
  return value === "male" || value === "female";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RequestBody | null;
  if (!body || !isMetric(body.metric) || !isSex(body.sex)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const metric = normalizeMetric(body.metric);
  const measurement =
    body.measurement !== undefined
      ? body.measurement
      : body.value !== undefined
        ? body.value
        : null;

  if (typeof measurement !== "number" || !Number.isFinite(measurement) || measurement <= 0) {
    return NextResponse.json({ error: "measurement must be a positive number" }, { status: 400 });
  }

  const hasDateInput =
    isIsoDate(body.dateOfBirth) &&
    isIsoDate(body.measuredAt);
  const hasAgeInput = typeof body.ageDays === "number" && Number.isFinite(body.ageDays) && body.ageDays >= 0;

  if (!hasDateInput && !hasAgeInput) {
    return NextResponse.json(
      { error: "Either (dateOfBirth + measuredAt) or ageDays is required" },
      { status: 400 },
    );
  }

  try {
    const result = hasAgeInput && !hasDateInput
      ? calculateGrowthPercentile({
          tables: whoGrowthTables,
          metric,
          sex: body.sex,
          ageDays: Math.floor(body.ageDays as number),
          measurement,
        })
      : calculateGrowthPercentileFromDates({
          tables: whoGrowthTables,
          metric,
          sex: body.sex,
          dateOfBirthIso: `${body.dateOfBirth}T00:00:00.000Z`,
          measuredAtIso: `${body.measuredAt}T00:00:00.000Z`,
          measurement,
        });

    return NextResponse.json({
      ok: true,
      metric,
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
