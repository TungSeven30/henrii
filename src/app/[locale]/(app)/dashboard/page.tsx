import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ActiveBabyHydrator } from "@/components/baby/active-baby-hydrator";
import { type DashboardTimelineEvent, DashboardContent } from "./dashboard-content";
import {
  calculateDailySummaries,
  type AnalyticsEvents,
} from "@/lib/analytics/calculate-summaries";
import { generateInsights } from "@/lib/insights/generate-insights";
import { getActiveBabyContext } from "@/lib/supabase/get-active-baby-context";

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string }>;
};

export const dynamic = "force-dynamic";

function getStartOfDayInTimezone(timezone: string): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) =>
    Number.parseInt(parts.find((part) => part.type === type)?.value ?? "0", 10);

  const msSinceMidnight = ((get("hour") * 60 + get("minute")) * 60 + get("second")) * 1000;

  return new Date(now.getTime() - msSinceMidnight).toISOString();
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const { supabase, activeBabyId } = await getActiveBabyContext(locale);

  const { data: baby } = await supabase
    .from("babies")
    .select("*")
    .eq("id", activeBabyId)
    .maybeSingle();

  if (!baby) {
    redirect(`/${locale}/onboarding`);
  }

  const now = new Date();
  const nowMs = now.getTime();
  const fourteenDaysAgoIso = new Date(nowMs - 14 * 86_400_000).toISOString();
  const dayStart = getStartOfDayInTimezone(baby.timezone);

  const [
    { count: feedCount },
    { count: sleepCount },
    { count: diaperCount },
    { count: feedTotalCount },
    { count: sleepTotalCount },
    { count: diaperTotalCount },
    lastFeedResult,
    lastSleepResult,
    lastDiaperResult,
    timelineFeedings,
    timelineSleep,
    timelineDiapers,
    recentFeedings,
    recentSleep,
    recentDiapers,
    latestGrowth,
  ] = await Promise.all([
    supabase
      .from("feedings")
      .select("id", { count: "exact", head: true })
      .eq("baby_id", activeBabyId)
      .gte("started_at", dayStart),
    supabase
      .from("sleep_sessions")
      .select("id", { count: "exact", head: true })
      .eq("baby_id", activeBabyId)
      .gte("started_at", dayStart),
    supabase
      .from("diaper_changes")
      .select("id", { count: "exact", head: true })
      .eq("baby_id", activeBabyId)
      .gte("changed_at", dayStart),
    supabase
      .from("feedings")
      .select("id", { count: "exact", head: true })
      .eq("baby_id", activeBabyId),
    supabase
      .from("sleep_sessions")
      .select("id", { count: "exact", head: true })
      .eq("baby_id", activeBabyId),
    supabase
      .from("diaper_changes")
      .select("id", { count: "exact", head: true })
      .eq("baby_id", activeBabyId),
    supabase
      .from("feedings")
      .select("*")
      .eq("baby_id", activeBabyId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("sleep_sessions")
      .select("*")
      .eq("baby_id", activeBabyId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("diaper_changes")
      .select("*")
      .eq("baby_id", activeBabyId)
      .order("changed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("feedings")
      .select("*")
      .eq("baby_id", activeBabyId)
      .order("started_at", { ascending: false })
      .limit(30),
    supabase
      .from("sleep_sessions")
      .select("*")
      .eq("baby_id", activeBabyId)
      .order("started_at", { ascending: false })
      .limit(30),
    supabase
      .from("diaper_changes")
      .select("*")
      .eq("baby_id", activeBabyId)
      .order("changed_at", { ascending: false })
      .limit(30),
    supabase
      .from("feedings")
      .select("*")
      .eq("baby_id", activeBabyId)
      .gte("started_at", fourteenDaysAgoIso)
      .order("started_at", { ascending: true }),
    supabase
      .from("sleep_sessions")
      .select("*")
      .eq("baby_id", activeBabyId)
      .gte("started_at", fourteenDaysAgoIso)
      .order("started_at", { ascending: true }),
    supabase
      .from("diaper_changes")
      .select("*")
      .eq("baby_id", activeBabyId)
      .gte("changed_at", fourteenDaysAgoIso)
      .order("changed_at", { ascending: true }),
    supabase
      .from("growth_measurements")
      .select("weight_percentile, length_percentile")
      .eq("baby_id", activeBabyId)
      .order("measured_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const timelineEvents: DashboardTimelineEvent[] = [
    ...(timelineFeedings.data ?? []).map((item) => ({
      id: `feeding-${item.id}`,
      type: "feeding" as const,
      happenedAt: item.started_at,
      summary: `${t("types.feeding")} · ${item.feeding_type ?? "bottle"}${item.amount_ml ? ` · ${item.amount_ml}ml` : ""}`,
    })),
    ...(timelineSleep.data ?? []).map((item) => ({
      id: `sleep-${item.id}`,
      type: "sleep" as const,
      happenedAt: item.started_at,
      summary: `${t("types.sleep")} · ${item.duration_minutes ?? 0}m`,
    })),
    ...(timelineDiapers.data ?? []).map((item) => ({
      id: `diaper-${item.id}`,
      type: "diaper" as const,
      happenedAt: item.changed_at,
      summary: `${t("types.diaper")} · ${item.change_type ?? "wet"}`,
    })),
  ].sort((a, b) => new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime());

  const totalLoggedEvents = (feedTotalCount ?? 0) + (sleepTotalCount ?? 0) + (diaperTotalCount ?? 0);

  const analyticsEvents: AnalyticsEvents = {
    feedings: (recentFeedings.data ?? []).map((row) => ({
      id: row.id,
      baby_id: row.baby_id,
      started_at: row.started_at,
      ended_at: null,
      type: row.feeding_type ?? "bottle",
      amount_ml: row.amount_ml,
    })),
    sleepSessions: (recentSleep.data ?? []).map((row) => ({
      id: row.id,
      baby_id: row.baby_id,
      started_at: row.started_at,
      ended_at: row.ended_at,
      quality: null,
    })),
    diaperChanges: (recentDiapers.data ?? []).map((row) => ({
      id: row.id,
      baby_id: row.baby_id,
      changed_at: row.changed_at,
      type: row.change_type ?? "wet",
      color: null,
      consistency: null,
    })),
  };

  const dailySummaries = calculateDailySummaries(
    analyticsEvents,
    {
      start: new Date(nowMs - 14 * 86_400_000),
      end: now,
    },
    baby.timezone,
  );

  const nowDate = new Date();
  const birthDate = new Date(baby.date_of_birth);
  let babyAgeMonths =
    (nowDate.getFullYear() - birthDate.getFullYear()) * 12 +
    (nowDate.getMonth() - birthDate.getMonth());
  if (nowDate.getDate() < birthDate.getDate()) {
    babyAgeMonths -= 1;
  }

  const insights = generateInsights(babyAgeMonths, dailySummaries, latestGrowth.data ?? null);
  const initialView = query.view === "timeline" ? "timeline" : "dashboard";
  const normalizedSex = baby.sex ?? null;

  const lastFeedData = lastFeedResult.data
    ? {
        id: lastFeedResult.data.id,
        feeding_type:
          (lastFeedResult.data as { feeding_type?: string; type?: string }).feeding_type ??
          (lastFeedResult.data as { type?: string }).type ??
          "bottle",
        amount_ml: lastFeedResult.data.amount_ml ?? null,
        started_at: lastFeedResult.data.started_at,
        notes: lastFeedResult.data.notes ?? null,
      }
    : null;

  const lastSleepData = lastSleepResult.data
    ? {
        id: lastSleepResult.data.id,
        started_at: lastSleepResult.data.started_at,
        ended_at: lastSleepResult.data.ended_at ?? null,
        duration_minutes: lastSleepResult.data.duration_minutes ?? null,
        notes: lastSleepResult.data.notes ?? null,
      }
    : null;

  const lastDiaperData = lastDiaperResult.data
    ? {
        id: lastDiaperResult.data.id,
        changed_at: lastDiaperResult.data.changed_at,
        change_type:
          (lastDiaperResult.data as { change_type?: string; type?: string }).change_type ??
          (lastDiaperResult.data as { type?: string }).type ??
          "wet",
        notes: lastDiaperResult.data.notes ?? null,
      }
    : null;

  return (
    <main className="henrii-page">
      <ActiveBabyHydrator
        activeBabyId={activeBabyId}
        activeBaby={{
          id: baby.id,
          name: baby.name,
          date_of_birth: baby.date_of_birth,
          sex: normalizedSex,
          country_code: baby.country_code,
          timezone: baby.timezone,
          owner_id: baby.owner_id,
          photo_url: (baby as { photo_url?: string | null }).photo_url ?? null,
        }}
      />
      <h1 className="henrii-title">{t("title")}</h1>
      <DashboardContent
        baby={{
          id: baby.id,
          name: baby.name,
          date_of_birth: baby.date_of_birth,
          sex: normalizedSex,
          country_code: baby.country_code,
          timezone: baby.timezone,
          owner_id: baby.owner_id,
          photo_url: (baby as { photo_url?: string | null }).photo_url ?? null,
        }}
        todayCounts={{
          feeds: feedCount ?? 0,
          sleeps: sleepCount ?? 0,
          diapers: diaperCount ?? 0,
        }}
        lastEvents={{
          lastFeed: lastFeedResult.data?.started_at ?? null,
          lastSleep: lastSleepResult.data?.started_at ?? null,
          lastDiaper: lastDiaperResult.data?.changed_at ?? null,
        }}
        lastFeedData={lastFeedData}
        lastSleepData={lastSleepData}
        lastDiaperData={lastDiaperData}
        insights={insights}
        timelineEvents={timelineEvents}
        initialView={initialView}
        totalEventCount={totalLoggedEvents}
      />
    </main>
  );
}
