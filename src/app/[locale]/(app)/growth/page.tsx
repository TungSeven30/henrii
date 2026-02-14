import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { Link } from "@/i18n/navigation";
import {
  PercentileCurvesChart,
  type PercentileCurvePoint,
} from "@/components/growth/percentile-curves-chart";
import { MilestoneItemArtwork } from "@/components/health/feature-artwork";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";
import { buildWHOCurveData, type GrowthMetricTab } from "@/lib/growth/who-percentile-curves";
import {
  UNIT_SYSTEM_COOKIE_NAME,
  cmToIn,
  kgToLb,
  parseUnitSystem,
  type UnitSystem,
} from "@/lib/units/system";
import {
  logGrowthMeasurementAction,
  seedMilestonesAction,
  updateMilestoneStatusAction,
} from "./actions";

type GrowthPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string;
    logged?: string;
    seeded?: string;
    updated?: string;
    metric?: string;
  }>;
};

type GrowthMeasurementRow = {
  id: string;
  measured_at: string;
  weight_kg?: number | string | null;
  weight_grams?: number | string | null;
  length_cm?: number | string | null;
  head_circumference_cm?: number | string | null;
  weight_percentile?: number | string | null;
  length_percentile?: number | string | null;
  head_percentile?: number | string | null;
  notes: string | null;
};

type BabyRow = {
  name: string | null;
  date_of_birth: string | null;
  sex: "male" | "female" | null;
};

type MilestoneRow = {
  id: string;
  milestone_key: string;
  status: "not_started" | "emerging" | "achieved";
  achieved_at: string | null;
  notes: string | null;
  milestone_definitions:
    | {
        name_en: string;
        name_vi: string;
        category: string;
        typical_age_min_months: number;
        typical_age_max_months: number;
      }
    | null;
};

export const dynamic = "force-dynamic";

function getGrowthFeedback(query: {
  error?: string;
  logged?: string;
  seeded?: string;
  updated?: string;
}) {
  if (query.error) {
    switch (query.error) {
      case "read_only":
        return {
          tone: "error" as const,
          message: "Caregiver logging is read-only until premium is active for this baby.",
        };
      case "missing_measurement":
        return {
          tone: "error" as const,
          message: "Add at least one measurement (weight, length, or head circumference).",
        };
      case "invalid_measured_at":
        return { tone: "error" as const, message: "Measured date is invalid." };
      case "future_measurement":
        return { tone: "error" as const, message: "Measured date cannot be in the future." };
      case "before_birth":
        return { tone: "error" as const, message: "Measured date cannot be before date of birth." };
      case "baby_not_found":
        return { tone: "error" as const, message: "Baby profile not found." };
      case "growth_insert_failed":
        return { tone: "error" as const, message: "Unable to save growth measurement." };
      case "seed_definitions_failed":
      case "seed_milestones_failed":
        return { tone: "error" as const, message: "Unable to load milestone checklist." };
      case "missing_milestone":
        return { tone: "error" as const, message: "Missing milestone to update." };
      case "milestone_update_failed":
        return { tone: "error" as const, message: "Unable to save milestone status." };
      default:
        return { tone: "error" as const, message: "Unable to complete request." };
    }
  }

  if (query.logged === "1") {
    return { tone: "success" as const, message: "Growth measurement saved." };
  }

  if (query.seeded === "1") {
    return { tone: "success" as const, message: "Milestone checklist loaded." };
  }

  if (query.updated === "1") {
    return { tone: "success" as const, message: "Milestone updated." };
  }

  return null;
}

function toNumberOrNull(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

const DAYS_PER_MONTH = 30.4375;

function parseGrowthMetric(rawMetric?: string): GrowthMetricTab {
  if (rawMetric === "length" || rawMetric === "head") {
    return rawMetric;
  }

  return "weight";
}

function getMetricLabel(metric: GrowthMetricTab) {
  switch (metric) {
    case "length":
      return {
        percentileKey: "length_percentile" as const,
      };
    case "head":
      return {
        percentileKey: "head_percentile" as const,
      };
    default:
      return {
        percentileKey: "weight_percentile" as const,
      };
  }
}

function calculateAgeMonths(dobIso: string, measuredAt: string) {
  const dobMs = new Date(`${dobIso}T00:00:00.000Z`).getTime();
  const measuredMs = new Date(`${measuredAt}T00:00:00.000Z`).getTime();
  const deltaMs = measuredMs - dobMs;
  if (!Number.isFinite(dobMs) || !Number.isFinite(measuredMs) || deltaMs <= 0) {
    return null;
  }

  return (deltaMs / (1000 * 60 * 60 * 24)) / DAYS_PER_MONTH;
}

function valueForMetric(
  row: GrowthMeasurementRow,
  metric: GrowthMetricTab,
  unitSystem: UnitSystem,
) {
  if (metric === "weight") {
    const weightKg = parseWeightKg(row);
    if (weightKg === null) {
      return null;
    }

    return unitSystem === "imperial" ? kgToLb(weightKg) : weightKg;
  }

  if (metric === "length") {
    const lengthCm = parseNumericMeasurement(row.length_cm);
    if (lengthCm === null) {
      return null;
    }

    return unitSystem === "imperial" ? cmToIn(lengthCm) : lengthCm;
  }

  const headCircumferenceCm = parseNumericMeasurement(row.head_circumference_cm);
  if (headCircumferenceCm === null) {
    return null;
  }

  return unitSystem === "imperial"
    ? cmToIn(headCircumferenceCm)
    : headCircumferenceCm;
}

function parseNumericMeasurement(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseWeightKg(row: GrowthMeasurementRow) {
  const weightKg = parseNumericMeasurement(row.weight_kg);
  if (weightKg !== null && weightKg > 0) {
    return weightKg;
  }

  const weightGrams = parseNumericMeasurement(row.weight_grams);
  if (weightGrams !== null && weightGrams > 0) {
    return weightGrams / 1000;
  }

  return null;
}

function buildGrowthChartData(
  measurements: GrowthMeasurementRow[] | null,
  metric: GrowthMetricTab,
  unitSystem: UnitSystem,
  babySex: BabyRow["sex"],
  babyDateOfBirth: BabyRow["date_of_birth"],
): PercentileCurvePoint[] {
  if (!babyDateOfBirth) {
    return [];
  }

  const rawRows = measurements ?? [];
  const rows = [...rawRows].reverse();
  const chartRows = new Map<number, PercentileCurvePoint>();

  const labels = getMetricLabel(metric);
  const percentileValues = rows.map((row) => {
    const ageMonths = calculateAgeMonths(babyDateOfBirth, row.measured_at);
    const value = valueForMetric(row, metric, unitSystem);
    const percentile =
      labels.percentileKey === "weight_percentile"
        ? toNumberOrNull(row.weight_percentile)
        : labels.percentileKey === "length_percentile"
          ? toNumberOrNull(row.length_percentile)
          : toNumberOrNull(row.head_percentile);

    return {
      ageMonths,
      value,
      date: row.measured_at,
      percentile,
    };
  });

  let maxMonths = 12;
  for (const row of percentileValues) {
    if (row.ageMonths && row.ageMonths > maxMonths) {
      maxMonths = row.ageMonths;
    }
  }

  const todayAgeMonths = calculateAgeMonths(babyDateOfBirth, new Date().toISOString().slice(0, 10));
  if (todayAgeMonths && todayAgeMonths > maxMonths) {
    maxMonths = todayAgeMonths;
  }

  const curves = buildWHOCurveData(metric, babySex === "female" ? "female" : "male", maxMonths + 3, unitSystem);

  for (const point of curves) {
    const key = Math.round(point.ageMonths * 10) / 10;
    chartRows.set(key, {
      ageMonths: key,
      p3: point.p3,
      p15: point.p15,
      p50: point.p50,
      p85: point.p85,
      p97: point.p97,
    });
  }

  for (const row of percentileValues) {
    if (!row.ageMonths) {
      continue;
    }

    const value = row.value;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      continue;
    }

    const ageMonths = Math.round(row.ageMonths * 10) / 10;
    const existing = chartRows.get(ageMonths) ?? {
      ageMonths,
      p3: null,
      p15: null,
      p50: null,
      p85: null,
      p97: null,
    };
    const point = {
      ...existing,
      measuredValue: Number(value.toFixed(2)),
      measuredPercentile: row.percentile ?? null,
      date: row.date,
    };
    chartRows.set(ageMonths, point);
  }

  return [...chartRows.values()].sort((left, right) => left.ageMonths - right.ageMonths);
}

function formatWeight(valueKg: number | null | undefined, unitSystem: UnitSystem) {
  if (typeof valueKg !== "number" || !Number.isFinite(valueKg) || valueKg <= 0) {
    return "—";
  }

  if (unitSystem === "imperial") {
    return `${kgToLb(valueKg).toFixed(1)}lb`;
  }

  return `${valueKg.toFixed(2)}kg`;
}

function formatLength(valueCm: number | null | undefined, unitSystem: UnitSystem) {
  if (typeof valueCm !== "number" || !Number.isFinite(valueCm) || valueCm <= 0) {
    return "—";
  }

  if (unitSystem === "imperial") {
    return `${cmToIn(valueCm).toFixed(1)}in`;
  }

  return `${valueCm.toFixed(1)}cm`;
}

function extractWeightKg(measurement: GrowthMeasurementRow) {
  const parsed = parseWeightKg(measurement);
  if (parsed === null || !Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function extractLengthCm(measurement: GrowthMeasurementRow) {
  const parsed = parseNumericMeasurement(measurement.length_cm);
  if (parsed === null || !Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function extractHeadCm(measurement: GrowthMeasurementRow) {
  const parsed = parseNumericMeasurement(measurement.head_circumference_cm);
  if (parsed === null || !Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function formatPercentile(value: number | string | null | undefined) {
  const parsed = toNumberOrNull(value);
  if (parsed === null) {
    return "—";
  }

  return `${Math.round(parsed)}th`;
}

export default async function GrowthPage({ params, searchParams }: GrowthPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "growth" });
  const cookieStore = await cookies();
  const unitSystem = parseUnitSystem(cookieStore.get(UNIT_SYSTEM_COOKIE_NAME)?.value);
  const { supabase, activeBabyId } = await getActiveBabyContext(locale);

  const [{ data: baby }, { data: measurements }, { data: milestones }] = await Promise.all([
    supabase
      .from("babies")
      .select("name, date_of_birth, sex")
      .eq("id", activeBabyId)
      .single(),
    supabase
      .from("growth_measurements")
      .select("*")
      .eq("baby_id", activeBabyId)
      .order("measured_at", { ascending: false })
      .limit(30),
    supabase
    .from("developmental_milestones")
      .select(
        "id, milestone_key, status, achieved_at, notes, milestone_definitions(name_en, name_vi, category, typical_age_min_months, typical_age_max_months)",
      )
      .eq("baby_id", activeBabyId)
      .order("created_at", { ascending: true }),
  ]);
  const typedBaby = (baby as BabyRow | null) ?? null;

  const growthMetric = parseGrowthMetric(query.metric);
  const metricTabs: Array<{ key: GrowthMetricTab; label: string }> = [
    { key: "weight", label: t("weight") },
    { key: "length", label: t("length") },
    { key: "head", label: t("head") },
  ];
  const chartData = buildGrowthChartData(
    measurements as GrowthMeasurementRow[] | null,
    growthMetric,
    unitSystem,
    (typedBaby?.sex as BabyRow["sex"] | null) ?? "male",
    typedBaby?.date_of_birth ?? null,
  );
  const today = new Date().toISOString().slice(0, 10);
  const milestoneRows = (milestones as MilestoneRow[] | null) ?? [];
  const feedback = getGrowthFeedback(query);
  const todayIso = new Date().toISOString().slice(0, 10);
  const weightLabel = unitSystem === "imperial" ? t("weightLb") : t("weightKg");
  const lengthLabel = unitSystem === "imperial" ? t("lengthIn") : t("lengthCm");
  const headLabel = unitSystem === "imperial" ? t("headCircumferenceIn") : t("headCircumferenceCm");
  const valueLabel =
    growthMetric === "weight"
      ? t("weight")
      : growthMetric === "length"
        ? t("length")
        : t("head");
  const chartUnit = growthMetric === "weight" ? (unitSystem === "imperial" ? t("lb") : t("kg")) : (unitSystem === "imperial" ? t("in") : t("cm"));

  return (
    <main className="henrii-page">
      <h1 className="henrii-title">{t("title")}</h1>
      {feedback ? (
        <p className={feedback.tone === "error" ? "henrii-feedback-error" : "henrii-feedback-success"}>
          {feedback.message}
        </p>
      ) : null}
      <p className="henrii-subtitle">
        {t("forBaby")}: <span className="font-semibold text-foreground">{typedBaby?.name ?? "Unknown"}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {metricTabs.map((metric) => (
          <Link
            key={metric.key}
            href={{ pathname: "/growth", query: { metric: metric.key } }}
            className={`rounded-full border px-3 py-1 text-sm ${
              growthMetric === metric.key
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground/80"
            }`}
          >
            {metric.label}
          </Link>
        ))}
      </div>

      <section id="milestones" className="henrii-card">
        <h2 className="font-heading text-xl font-semibold">{t("logGrowthTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("logGrowthBody")}</p>

        <form action={logGrowthMeasurementAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="unitSystem" value={unitSystem} />
          <label className="grid gap-1 text-sm">
            {t("measuredAt")}
            <input
              name="measuredAt"
              type="date"
              defaultValue={today}
              max={todayIso}
              required
              className="henrii-input"
            />
          </label>
          <label className="grid gap-1 text-sm">
            {weightLabel}
            <input
              name="weight"
              type="number"
              min="0"
              step={unitSystem === "imperial" ? "0.1" : "0.01"}
              placeholder={unitSystem === "imperial" ? "12.8" : "5.8"}
              className="henrii-input"
            />
          </label>
          <label className="grid gap-1 text-sm">
            {lengthLabel}
            <input
              name="length"
              type="number"
              min="0"
              step="0.1"
              placeholder={unitSystem === "imperial" ? "24.2" : "61.4"}
              className="henrii-input"
            />
          </label>
          <label className="grid gap-1 text-sm">
            {headLabel}
            <input
              name="headCircumference"
              type="number"
              min="0"
              step="0.1"
              placeholder={unitSystem === "imperial" ? "15.9" : "40.3"}
              className="henrii-input"
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            {t("notes")}
            <textarea name="notes" className="henrii-textarea min-h-20" />
          </label>
          <button type="submit" className="henrii-btn-primary sm:col-span-2">
            {t("saveGrowth")}
          </button>
        </form>

        {measurements && measurements.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {measurements.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-border/70 px-3 py-2 text-sm"
                >
                  <p className="font-medium">
                    {item.measured_at} · {formatWeight(extractWeightKg(item), unitSystem)} ·{" "}
                    {formatLength(extractLengthCm(item), unitSystem)} ·{" "}
                    {formatLength(extractHeadCm(item), unitSystem)}
                  </p>
                <p className="text-xs text-muted-foreground">
                  {t("percentiles")}: {t("weightShort")} {formatPercentile(item.weight_percentile)} ·{" "}
                  {t("lengthShort")} {formatPercentile(item.length_percentile)} ·{" "}
                  {t("headShort")} {formatPercentile(item.head_percentile)}
                </p>
                {item.notes ? <p className="text-xs text-muted-foreground">{item.notes}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{t("emptyGrowth")}</p>
        )}
      </section>

      <PercentileCurvesChart
        data={chartData}
        labels={{
          title: t("percentileChartTitle"),
          subtitle: t("percentileChartBody"),
          valueSeriesLabel: valueLabel,
          unit: chartUnit,
          p3: t("p3"),
          p15: t("p15"),
          p50: t("p50"),
          p85: t("p85"),
          p97: t("p97"),
          empty: t("emptyGrowth"),
        }}
      />

      <section className="henrii-card">
        <h2 className="font-heading text-xl font-semibold">{t("milestonesTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("milestonesBody")}</p>

        {milestoneRows.length === 0 ? (
          <form action={seedMilestonesAction} className="mt-4">
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="henrii-btn-primary"
            >
              {t("seedMilestones")}
            </button>
          </form>
        ) : (
          <ul className="mt-4 space-y-3">
            {milestoneRows.map((item) => {
              const definition = item.milestone_definitions;
              const title =
                locale === "vi" ? definition?.name_vi ?? item.milestone_key : definition?.name_en ?? item.milestone_key;
              const iconClass =
                item.status === "achieved"
                  ? "text-emerald-700"
                  : item.status === "emerging"
                    ? "text-amber-600"
                    : "text-slate-500";
              const iconContainerClass =
                item.status === "achieved"
                  ? "border-emerald-300 bg-emerald-50"
                  : item.status === "emerging"
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-300/60 bg-slate-50";

              return (
                <li key={item.id} className="rounded-xl border border-border/70 p-3">
                  <div className="flex gap-3">
                    <div
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${iconContainerClass}`}
                      title={item.milestone_key}
                    >
                      <MilestoneItemArtwork
                        milestoneKey={item.milestone_key}
                        className={`h-7 w-7 ${iconClass}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">
                        {definition?.category ?? "—"} · {definition?.typical_age_min_months ?? "?"}-
                        {definition?.typical_age_max_months ?? "?"} {t("months")}
                      </p>
                      <form action={updateMilestoneStatusAction} className="mt-2 grid gap-2 sm:grid-cols-3">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="milestoneId" value={item.id} />
                        <label className="grid gap-1 text-xs">
                          {t("status")}
                          <select
                            name="status"
                            defaultValue={item.status}
                            className="h-9 rounded-lg border border-border bg-background px-2 text-sm transition focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                          >
                            <option value="not_started">{t("statusNotStarted")}</option>
                            <option value="emerging">{t("statusEmerging")}</option>
                            <option value="achieved">{t("statusAchieved")}</option>
                          </select>
                        </label>
                        <label className="grid gap-1 text-xs">
                          {t("achievedAt")}
                          <input
                            name="achievedAt"
                            type="date"
                            defaultValue={item.achieved_at ?? ""}
                            className="h-9 rounded-lg border border-border bg-background px-2 text-sm transition focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                          />
                        </label>
                        <label className="grid gap-1 text-xs sm:col-span-3">
                          {t("notes")}
                          <input
                            name="notes"
                            defaultValue={item.notes ?? ""}
                            className="h-9 rounded-lg border border-border bg-background px-2 text-sm transition focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                          />
                        </label>
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-3 text-xs font-semibold transition hover:bg-accent sm:col-span-3"
                        >
                          {t("saveMilestone")}
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
