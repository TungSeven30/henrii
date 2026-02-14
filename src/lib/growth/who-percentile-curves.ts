import { interpolateLms, type GrowthMetric, type GrowthSex } from "@/lib/growth/percentile";
import { whoGrowthTables } from "@/lib/growth/who-growth-tables";
import { cmToIn, kgToLb, type UnitSystem } from "@/lib/units/system";

const DAYS_PER_MONTH = 30.4375;
const MIN_MONTHS = 12;

// Standard z-scores for WHO percentile curves.
const PERCENTILE_Z_SCORES: Record<number, number> = {
  3: -1.88079,
  15: -1.03643,
  50: 0,
  85: 1.03643,
  97: 1.88079,
};

export const WHO_PERCENTILES = [3, 15, 50, 85, 97] as const;
export type WHOPercentile = (typeof WHO_PERCENTILES)[number];

export type GrowthMetricTab = "weight" | "length" | "head";
export type WHOCurvePoint = {
  ageMonths: number;
  p3: number | null;
  p15: number | null;
  p50: number | null;
  p85: number | null;
  p97: number | null;
};

function metricForTab(tab: GrowthMetricTab): GrowthMetric {
  switch (tab) {
    case "weight":
      return "weight_for_age";
    case "length":
      return "length_for_age";
    case "head":
      return "head_circumference_for_age";
    default:
      return "weight_for_age";
  }
}

function lmsInverse(L: number, M: number, S: number, z: number): number {
  if (Math.abs(L) < 1e-10) {
    return M * Math.exp(S * z);
  }

  const inside = 1 + L * S * z;
  if (inside <= 0) {
    return 0;
  }

  return M * Math.pow(inside, 1 / L);
}

function toChartValue(valueKgOrCm: number, tab: GrowthMetricTab, unitSystem: UnitSystem) {
  if (tab === "weight") {
    return unitSystem === "imperial" ? kgToLb(valueKgOrCm) : valueKgOrCm;
  }

  return unitSystem === "imperial" ? cmToIn(valueKgOrCm) : valueKgOrCm;
}

export function buildWHOCurveData(
  tab: GrowthMetricTab,
  sex: GrowthSex,
  maxMonthsInput: number,
  unitSystem: UnitSystem,
): WHOCurvePoint[] {
  const metric = metricForTab(tab);
  const table = whoGrowthTables[metric]?.[sex];
  if (!table?.length) {
    return [];
  }

  const lastMonthInTable = Math.floor(table[table.length - 1].ageDays / DAYS_PER_MONTH);
  const maxMonths = Math.max(
    Math.min(Math.floor(maxMonthsInput), lastMonthInTable),
    MIN_MONTHS,
  );

  const points: WHOCurvePoint[] = [];
  for (let month = 0; month <= maxMonths; month += 1) {
    const ageDays = Math.round(month * DAYS_PER_MONTH);
    const { l, m, s } = interpolateLms(table, ageDays);
    const p3 = toChartValue(lmsInverse(l, m, s, PERCENTILE_Z_SCORES[3]), tab, unitSystem);
    const p15 = toChartValue(lmsInverse(l, m, s, PERCENTILE_Z_SCORES[15]), tab, unitSystem);
    const p50 = toChartValue(lmsInverse(l, m, s, PERCENTILE_Z_SCORES[50]), tab, unitSystem);
    const p85 = toChartValue(lmsInverse(l, m, s, PERCENTILE_Z_SCORES[85]), tab, unitSystem);
    const p97 = toChartValue(lmsInverse(l, m, s, PERCENTILE_Z_SCORES[97]), tab, unitSystem);

    points.push({
      ageMonths: month,
      p3: Number.isFinite(p3) ? Number(p3.toFixed(2)) : null,
      p15: Number.isFinite(p15) ? Number(p15.toFixed(2)) : null,
      p50: Number.isFinite(p50) ? Number(p50.toFixed(2)) : null,
      p85: Number.isFinite(p85) ? Number(p85.toFixed(2)) : null,
      p97: Number.isFinite(p97) ? Number(p97.toFixed(2)) : null,
    });
  }

  return points;
}
