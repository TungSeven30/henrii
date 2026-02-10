import { getTranslations } from "next-intl/server";
import { DailyTrendsChart, type DailyTrendPoint } from "@/components/analytics/daily-trends-chart";
import { getBabyPremiumStatus } from "@/lib/billing/baby-plan";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";

type AnalyticsPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

function toDayKey(dateIso: string) {
  return new Date(dateIso).toISOString().slice(0, 10);
}

function average(numbers: number[]) {
  if (!numbers.length) {
    return 0;
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "analytics" });
  const { supabase, activeBabyId } = await getActiveBabyContext(locale);
  const plan = await getBabyPremiumStatus({
    supabase: supabase as unknown as Parameters<typeof getBabyPremiumStatus>[0]["supabase"],
    babyId: activeBabyId,
  });

  if (!plan.premium) {
    return (
      <main className="henrii-page">
        <h1 className="henrii-title">{t("title")}</h1>
        <section className="henrii-card">
          <p className="text-sm text-muted-foreground">{t("paywallBody")}</p>
        </section>
      </main>
    );
  }

  const lookbackStart = new Date();
  lookbackStart.setDate(lookbackStart.getDate() - 14);

  const [feedings, sleepSessions, diaperChanges] = await Promise.all([
    supabase
      .from("feedings")
      .select("started_at")
      .eq("baby_id", activeBabyId)
      .gte("started_at", lookbackStart.toISOString())
      .order("started_at", { ascending: true }),
    supabase
      .from("sleep_sessions")
      .select("started_at, duration_minutes")
      .eq("baby_id", activeBabyId)
      .gte("started_at", lookbackStart.toISOString())
      .order("started_at", { ascending: true }),
    supabase
      .from("diaper_changes")
      .select("changed_at")
      .eq("baby_id", activeBabyId)
      .gte("changed_at", lookbackStart.toISOString())
      .order("changed_at", { ascending: true }),
  ]);

  const daily = new Map<string, DailyTrendPoint>();
  for (let i = 0; i < 14; i += 1) {
    const dayDate = new Date(lookbackStart);
    dayDate.setDate(lookbackStart.getDate() + i);
    const day = dayDate.toISOString().slice(5, 10);
    daily.set(day, {
      day,
      feeds: 0,
      sleepSessions: 0,
      diapers: 0,
    });
  }

  for (const row of feedings.data ?? []) {
    const day = toDayKey(row.started_at).slice(5, 10);
    const current = daily.get(day);
    if (current) {
      current.feeds += 1;
    }
  }

  for (const row of sleepSessions.data ?? []) {
    const day = toDayKey(row.started_at).slice(5, 10);
    const current = daily.get(day);
    if (current) {
      current.sleepSessions += 1;
    }
  }

  for (const row of diaperChanges.data ?? []) {
    const day = toDayKey(row.changed_at).slice(5, 10);
    const current = daily.get(day);
    if (current) {
      current.diapers += 1;
    }
  }

  const trendData = [...daily.values()];
  const totalFeeds = trendData.reduce((sum, row) => sum + row.feeds, 0);
  const totalSleepSessions = trendData.reduce((sum, row) => sum + row.sleepSessions, 0);
  const totalDiapers = trendData.reduce((sum, row) => sum + row.diapers, 0);

  const sleepDurations = (sleepSessions.data ?? [])
    .map((row) => row.duration_minutes ?? 0)
    .filter((value) => value > 0);
  const avgSleepMinutes = average(sleepDurations);

  const feedingTimes = (feedings.data ?? []).map((row) => new Date(row.started_at).getTime());
  const feedingIntervalsHours: number[] = [];
  for (let i = 1; i < feedingTimes.length; i += 1) {
    feedingIntervalsHours.push((feedingTimes[i] - feedingTimes[i - 1]) / (1000 * 60 * 60));
  }

  const recentFeedIntervals = feedingIntervalsHours.slice(-3);
  const previousFeedIntervals = feedingIntervalsHours.slice(-6, -3);
  const feedingIntervalIncreasing =
    recentFeedIntervals.length > 0 &&
    previousFeedIntervals.length > 0 &&
    average(recentFeedIntervals) - average(previousFeedIntervals) > 0.75;

  const recentSleepDurations = sleepDurations.slice(-3);
  const previousSleepDurations = sleepDurations.slice(-6, -3);
  const sleepTrendingDown =
    recentSleepDurations.length > 0 &&
    previousSleepDurations.length > 0 &&
    average(previousSleepDurations) - average(recentSleepDurations) > 20;

  const latestDiaperAt = (diaperChanges.data ?? []).at(-1)?.changed_at ?? null;
  const noDiaperThreshold = new Date();
  noDiaperThreshold.setHours(noDiaperThreshold.getHours() - 48);
  const noDiaper48h = !latestDiaperAt || new Date(latestDiaperAt) < noDiaperThreshold;

  const patterns = [
    noDiaper48h ? t("patterns.noDiaper48h") : null,
    feedingIntervalIncreasing ? t("patterns.feedingIntervalIncreasing") : null,
    sleepTrendingDown ? t("patterns.sleepTrendingDown") : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <main className="henrii-page">
      <h1 className="henrii-title">{t("title")}</h1>
      <section className="grid gap-3 sm:grid-cols-4">
        <article className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">{t("cards.feeds14d")}</p>
          <p className="mt-1 font-heading text-2xl font-bold">{totalFeeds}</p>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">{t("cards.sleepSessions14d")}</p>
          <p className="mt-1 font-heading text-2xl font-bold">{totalSleepSessions}</p>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">{t("cards.diapers14d")}</p>
          <p className="mt-1 font-heading text-2xl font-bold">{totalDiapers}</p>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">{t("cards.avgSleepMinutes")}</p>
          <p className="mt-1 font-heading text-2xl font-bold">{Math.round(avgSleepMinutes)}</p>
        </article>
      </section>

      <section className="henrii-card">
        <h2 className="font-heading text-xl font-semibold">{t("trendsTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("trendsBody")}</p>
        <div className="mt-4">
          <DailyTrendsChart
            data={trendData}
            labels={{
              feeds: t("series.feeds"),
              sleep: t("series.sleep"),
              diapers: t("series.diapers"),
              empty: t("empty"),
            }}
          />
        </div>
      </section>

      <section className="henrii-card">
        <h2 className="font-heading text-xl font-semibold">{t("patternsTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("patternsBody")}</p>
        {patterns.length ? (
          <ul className="mt-3 space-y-2">
            {patterns.map((pattern) => (
              <li key={pattern} className="rounded-xl border border-border/70 px-3 py-2 text-sm">
                {pattern}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t("patternsNone")}</p>
        )}
      </section>
    </main>
  );
}
