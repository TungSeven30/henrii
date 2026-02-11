import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import {
  PercentileCurvesChart,
  type PercentileCurvePoint,
} from "@/components/growth/percentile-curves-chart";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";
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
  searchParams: Promise<{ error?: string; logged?: string; seeded?: string; updated?: string }>;
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
      .select("name")
      .eq("id", activeBabyId)
      .single(),
    supabase
      .from("growth_measurements")
      .select(
        "id, measured_at, weight_kg, length_cm, head_circumference_cm, weight_percentile, length_percentile, head_percentile, notes",
      )
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

  const today = new Date().toISOString().slice(0, 10);
  const milestoneRows = (milestones as MilestoneRow[] | null) ?? [];
  const chartData: PercentileCurvePoint[] = [...(measurements ?? [])]
    .reverse()
    .map((item) => {
      const date = item.measured_at;
      return {
        date,
        label: date.slice(5),
        weightPercentile: toNumberOrNull(item.weight_percentile),
        lengthPercentile: toNumberOrNull(item.length_percentile),
        headPercentile: toNumberOrNull(item.head_percentile),
      };
    });
  const feedback = getGrowthFeedback(query);
  const todayIso = new Date().toISOString().slice(0, 10);
  const weightLabel = unitSystem === "imperial" ? t("weightLb") : t("weightKg");
  const lengthLabel = unitSystem === "imperial" ? t("lengthIn") : t("lengthCm");
  const headLabel = unitSystem === "imperial" ? t("headCircumferenceIn") : t("headCircumferenceCm");

  return (
    <main className="henrii-page">
      <h1 className="henrii-title">{t("title")}</h1>
      {feedback ? (
        <p className={feedback.tone === "error" ? "henrii-feedback-error" : "henrii-feedback-success"}>
          {feedback.message}
        </p>
      ) : null}
      <p className="henrii-subtitle">
        {t("forBaby")}: <span className="font-semibold text-foreground">{baby?.name ?? "Unknown"}</span>
      </p>

      <section className="henrii-card">
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
                  {item.measured_at} · {formatWeight(item.weight_kg, unitSystem)} ·{" "}
                  {formatLength(item.length_cm, unitSystem)} ·{" "}
                  {formatLength(item.head_circumference_cm, unitSystem)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("percentiles")}: {t("weightShort")} {item.weight_percentile?.toFixed?.(1) ?? "—"} ·{" "}
                  {t("lengthShort")} {item.length_percentile?.toFixed?.(1) ?? "—"} ·{" "}
                  {t("headShort")} {item.head_percentile?.toFixed?.(1) ?? "—"}
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
          weight: t("weightLabel"),
          length: t("lengthLabel"),
          head: t("headLabel"),
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

              return (
                <li key={item.id} className="rounded-xl border border-border/70 p-3">
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
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
