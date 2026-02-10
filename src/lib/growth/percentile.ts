export type GrowthMetric =
  | "weight_for_age"
  | "length_for_age"
  | "head_circumference_for_age";

export type GrowthSex = "male" | "female";

export type LmsPoint = {
  ageDays: number;
  l: number;
  m: number;
  s: number;
};

export type WhoGrowthTables = Record<GrowthMetric, Record<GrowthSex, LmsPoint[]>>;

export type GrowthPercentileResult = {
  ageDays: number;
  zScore: number;
  percentile: number;
  lms: LmsPoint;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function calculateAgeInDays(dateOfBirthIso: string, measuredAtIso: string): number {
  const dateOfBirth = new Date(dateOfBirthIso);
  const measuredAt = new Date(measuredAtIso);

  if (Number.isNaN(dateOfBirth.getTime()) || Number.isNaN(measuredAt.getTime())) {
    throw new Error("Invalid birth date or measured date.");
  }

  const ms = measuredAt.getTime() - dateOfBirth.getTime();
  if (ms < 0) {
    throw new Error("Measured date cannot be before date of birth.");
  }

  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export function interpolateLms(points: LmsPoint[], ageDays: number): LmsPoint {
  if (!points.length) {
    throw new Error("LMS table has no data points.");
  }

  const sorted = [...points].sort((a, b) => a.ageDays - b.ageDays);

  if (ageDays <= sorted[0].ageDays) {
    return sorted[0];
  }

  if (ageDays >= sorted[sorted.length - 1].ageDays) {
    return sorted[sorted.length - 1];
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];

    if (ageDays < current.ageDays || ageDays > next.ageDays) {
      continue;
    }

    const span = next.ageDays - current.ageDays;
    const ratio = span === 0 ? 0 : (ageDays - current.ageDays) / span;

    return {
      ageDays,
      l: current.l + (next.l - current.l) * ratio,
      m: current.m + (next.m - current.m) * ratio,
      s: current.s + (next.s - current.s) * ratio,
    };
  }

  return sorted[sorted.length - 1];
}

export function zScoreFromLms(value: number, lms: LmsPoint): number {
  if (value <= 0) {
    throw new Error("Measurement must be positive.");
  }

  if (lms.s <= 0 || lms.m <= 0) {
    throw new Error("Invalid LMS values.");
  }

  if (lms.l === 0) {
    return Math.log(value / lms.m) / lms.s;
  }

  return (Math.pow(value / lms.m, lms.l) - 1) / (lms.l * lms.s);
}

// Abramowitz and Stegun formula 7.1.26 approximation for erf(x)
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) *
      Math.exp(-absX * absX);

  return sign * y;
}

export function normalCdf(zScore: number): number {
  return 0.5 * (1 + erf(zScore / Math.sqrt(2)));
}

export function percentileFromZScore(zScore: number): number {
  return clamp(normalCdf(zScore) * 100, 0, 100);
}

export function calculateGrowthPercentile({
  tables,
  metric,
  sex,
  ageDays,
  measurement,
}: {
  tables: WhoGrowthTables;
  metric: GrowthMetric;
  sex: GrowthSex;
  ageDays: number;
  measurement: number;
}): GrowthPercentileResult {
  const table = tables[metric]?.[sex];
  if (!table?.length) {
    throw new Error(`Missing LMS table for metric=${metric}, sex=${sex}`);
  }

  const lms = interpolateLms(table, ageDays);
  const zScore = zScoreFromLms(measurement, lms);

  return {
    ageDays,
    zScore,
    percentile: percentileFromZScore(zScore),
    lms,
  };
}

export function calculateGrowthPercentileFromDates({
  tables,
  metric,
  sex,
  dateOfBirthIso,
  measuredAtIso,
  measurement,
}: {
  tables: WhoGrowthTables;
  metric: GrowthMetric;
  sex: GrowthSex;
  dateOfBirthIso: string;
  measuredAtIso: string;
  measurement: number;
}): GrowthPercentileResult {
  const ageDays = calculateAgeInDays(dateOfBirthIso, measuredAtIso);
  return calculateGrowthPercentile({
    tables,
    metric,
    sex,
    ageDays,
    measurement,
  });
}
