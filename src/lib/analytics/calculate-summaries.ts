import {
  eachDayOfInterval,
  differenceInMinutes,
  format,
} from "date-fns";

// --- Raw event types (matching Supabase table shapes) ---

export interface FeedingEvent {
  id: string;
  baby_id: string;
  started_at: string;
  ended_at: string | null;
  type: string;
  amount_ml: number | null;
}

export interface SleepEvent {
  id: string;
  baby_id: string;
  started_at: string;
  ended_at: string | null;
  quality: string | null;
}

export interface DiaperEvent {
  id: string;
  baby_id: string;
  changed_at: string;
  type: string;
  color: string | null;
  consistency: string | null;
}

export interface AnalyticsEvents {
  feedings: FeedingEvent[];
  sleepSessions: SleepEvent[];
  diaperChanges: DiaperEvent[];
}

// --- Output types ---

export interface DailySummary {
  date: string; // YYYY-MM-DD
  feedCount: number;
  feedTotalMinutes: number;
  sleepCount: number;
  sleepTotalMinutes: number;
  diaperCount: number;
  avgFeedingIntervalMinutes: number | null;
}

export interface WeeklyTrend {
  avgFeedsPerDay: { current: number; previous: number; changePercent: number };
  avgSleepMinutesPerDay: { current: number; previous: number; changePercent: number };
  avgDiapersPerDay: { current: number; previous: number; changePercent: number };
}

export interface Averages {
  feedsPerDay: number;
  sleepMinutesPerDay: number;
  diapersPerDay: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Return the local YYYY-MM-DD in the given timezone for an ISO timestamp.
 * Uses Intl.DateTimeFormat to avoid pulling in date-fns-tz.
 */
function localDateKey(isoString: string, timezone: string): string {
  const d = new Date(isoString);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Aggregate feedings, sleep, and diapers into per-day summaries.
 * All timestamps are normalized to the baby's timezone so "today"
 * means the baby's local day, not UTC.
 */
export function calculateDailySummaries(
  events: AnalyticsEvents,
  dateRange: DateRange,
  timezone: string,
): DailySummary[] {
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });

  // Pre-build empty buckets keyed by YYYY-MM-DD
  const buckets = new Map<string, DailySummary>();
  for (const day of days) {
    const key = dateKey(day);
    buckets.set(key, {
      date: key,
      feedCount: 0,
      feedTotalMinutes: 0,
      sleepCount: 0,
      sleepTotalMinutes: 0,
      diaperCount: 0,
      avgFeedingIntervalMinutes: null,
    });
  }

  // Feed timestamps per day (for interval calculation)
  const feedTimesPerDay = new Map<string, Date[]>();

  for (const f of events.feedings) {
    const key = localDateKey(f.started_at, timezone);
    const bucket = buckets.get(key);
    if (!bucket) continue;

    bucket.feedCount += 1;
    if (f.ended_at) {
      bucket.feedTotalMinutes += Math.max(
        0,
        differenceInMinutes(new Date(f.ended_at), new Date(f.started_at)),
      );
    }

    const times = feedTimesPerDay.get(key) ?? [];
    times.push(new Date(f.started_at));
    feedTimesPerDay.set(key, times);
  }

  for (const s of events.sleepSessions) {
    const key = localDateKey(s.started_at, timezone);
    const bucket = buckets.get(key);
    if (!bucket) continue;

    bucket.sleepCount += 1;
    if (s.ended_at) {
      bucket.sleepTotalMinutes += Math.max(
        0,
        differenceInMinutes(new Date(s.ended_at), new Date(s.started_at)),
      );
    }
  }

  for (const d of events.diaperChanges) {
    const key = localDateKey(d.changed_at, timezone);
    const bucket = buckets.get(key);
    if (!bucket) continue;

    bucket.diaperCount += 1;
  }

  // Calculate average feeding intervals per day
  for (const [key, times] of feedTimesPerDay) {
    const bucket = buckets.get(key);
    if (!bucket || times.length < 2) continue;

    times.sort((a, b) => a.getTime() - b.getTime());
    let totalGap = 0;
    for (let i = 1; i < times.length; i++) {
      totalGap += differenceInMinutes(times[i], times[i - 1]);
    }
    bucket.avgFeedingIntervalMinutes = totalGap / (times.length - 1);
  }

  return days.map((day) => buckets.get(dateKey(day))!);
}

/**
 * Compare the most recent half of the daily summaries to the prior half.
 * If the range is 14 days, "current" = last 7, "previous" = first 7.
 */
export function calculateWeeklyTrends(dailySummaries: DailySummary[]): WeeklyTrend {
  const midpoint = Math.floor(dailySummaries.length / 2);
  const previous = dailySummaries.slice(0, midpoint);
  const current = dailySummaries.slice(midpoint);

  function avg(arr: DailySummary[], getter: (d: DailySummary) => number): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, d) => sum + getter(d), 0) / arr.length;
  }

  function pctChange(cur: number, prev: number): number {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  }

  const curFeeds = avg(current, (d) => d.feedCount);
  const prevFeeds = avg(previous, (d) => d.feedCount);
  const curSleep = avg(current, (d) => d.sleepTotalMinutes);
  const prevSleep = avg(previous, (d) => d.sleepTotalMinutes);
  const curDiapers = avg(current, (d) => d.diaperCount);
  const prevDiapers = avg(previous, (d) => d.diaperCount);

  return {
    avgFeedsPerDay: {
      current: curFeeds,
      previous: prevFeeds,
      changePercent: pctChange(curFeeds, prevFeeds),
    },
    avgSleepMinutesPerDay: {
      current: curSleep,
      previous: prevSleep,
      changePercent: pctChange(curSleep, prevSleep),
    },
    avgDiapersPerDay: {
      current: curDiapers,
      previous: prevDiapers,
      changePercent: pctChange(curDiapers, prevDiapers),
    },
  };
}

/**
 * Simple averages across the entire range.
 */
export function calculateAverages(dailySummaries: DailySummary[]): Averages {
  if (dailySummaries.length === 0) {
    return { feedsPerDay: 0, sleepMinutesPerDay: 0, diapersPerDay: 0 };
  }

  const total = dailySummaries.reduce(
    (acc, d) => ({
      feeds: acc.feeds + d.feedCount,
      sleep: acc.sleep + d.sleepTotalMinutes,
      diapers: acc.diapers + d.diaperCount,
    }),
    { feeds: 0, sleep: 0, diapers: 0 },
  );

  const n = dailySummaries.length;
  return {
    feedsPerDay: total.feeds / n,
    sleepMinutesPerDay: total.sleep / n,
    diapersPerDay: total.diapers / n,
  };
}
