import type { DailySummary } from "@/lib/analytics/calculate-summaries";

export interface Insight {
  id: string;
  type: "info" | "positive" | "tip";
  titleKey: string;
  messageKey: string;
  messageValues: Record<string, string | number>;
  source: string;
}

interface LatestGrowth {
  weight_percentile: number | null;
  length_percentile: number | null;
}

// WHO normal sleep ranges by age bracket (hours per day)
const SLEEP_RANGES: Array<{
  maxMonths: number;
  label: string;
  min: number;
  max: number;
}> = [
  { maxMonths: 3, label: "0-3", min: 14, max: 17 },
  { maxMonths: 6, label: "3-6", min: 12, max: 16 },
  { maxMonths: 12, label: "6-12", min: 12, max: 15 },
  { maxMonths: 24, label: "12-24", min: 11, max: 14 },
  { maxMonths: 36, label: "24-36", min: 10, max: 13 },
];

// AAP feeding frequency ranges by age bracket (feeds per day)
const FEED_RANGES: Array<{
  maxMonths: number;
  min: number;
  max: number;
}> = [
  { maxMonths: 1, min: 8, max: 12 },
  { maxMonths: 3, min: 7, max: 9 },
  { maxMonths: 6, min: 5, max: 7 },
  { maxMonths: 12, min: 4, max: 6 },
];

function getSleepRange(ageMonths: number) {
  return SLEEP_RANGES.find((r) => ageMonths < r.maxMonths) ?? SLEEP_RANGES[SLEEP_RANGES.length - 1];
}

function getFeedRange(ageMonths: number) {
  return FEED_RANGES.find((r) => ageMonths < r.maxMonths) ?? FEED_RANGES[FEED_RANGES.length - 1];
}

function avgOverDays(
  summaries: DailySummary[],
  getter: (s: DailySummary) => number,
  lastN: number,
): number | null {
  const slice = summaries.slice(-lastN);
  if (slice.length === 0) return null;
  const total = slice.reduce((sum, s) => sum + getter(s), 0);
  return total / slice.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Generate age-aware, data-driven insights from recent tracking data.
 * Pure function, no side effects. Returns at most 2 insights, picking
 * the first matching rules in priority order.
 */
export function generateInsights(
  babyAgeMonths: number,
  recentSummaries: DailySummary[],
  latestGrowth: LatestGrowth | null,
): Insight[] {
  const insights: Insight[] = [];

  if (recentSummaries.length === 0) return insights;

  // Rule 1: Sleep duration normal range (last 7 days)
  const avgSleepMinutes = avgOverDays(recentSummaries, (s) => s.sleepTotalMinutes, 7);
  if (avgSleepMinutes !== null && avgSleepMinutes > 0) {
    const avgSleepHours = avgSleepMinutes / 60;
    const range = getSleepRange(babyAgeMonths);

    if (avgSleepHours >= range.min && avgSleepHours <= range.max) {
      insights.push({
        id: "sleep-on-track",
        type: "positive",
        titleKey: "insights.sleepOnTrack",
        messageKey: "insights.sleepOnTrackMsg",
        messageValues: {
          ageRange: range.label,
          min: range.min,
          max: range.max,
          avg: round1(avgSleepHours),
        },
        source: "WHO",
      });
    } else if (avgSleepHours < range.min - 1) {
      insights.push({
        id: "sleep-low",
        type: "tip",
        titleKey: "insights.sleepLow",
        messageKey: "insights.sleepLowMsg",
        messageValues: {
          ageRange: range.label,
          min: range.min,
          max: range.max,
          avg: round1(avgSleepHours),
        },
        source: "WHO",
      });
    }
  }

  if (insights.length >= 2) return insights;

  // Rule 2: Feeding interval trend (this week vs last week)
  if (recentSummaries.length >= 10) {
    const midpoint = Math.floor(recentSummaries.length / 2);
    const previousWeek = recentSummaries.slice(0, midpoint);
    const currentWeek = recentSummaries.slice(midpoint);

    const prevIntervals = previousWeek
      .map((s) => s.avgFeedingIntervalMinutes)
      .filter((v): v is number => v !== null);
    const curIntervals = currentWeek
      .map((s) => s.avgFeedingIntervalMinutes)
      .filter((v): v is number => v !== null);

    if (prevIntervals.length > 0 && curIntervals.length > 0) {
      const prevAvg = prevIntervals.reduce((a, b) => a + b, 0) / prevIntervals.length;
      const curAvg = curIntervals.reduce((a, b) => a + b, 0) / curIntervals.length;

      if (prevAvg > 0 && (curAvg - prevAvg) / prevAvg > 0.2) {
        insights.push({
          id: "feeding-stretching",
          type: "info",
          titleKey: "insights.feedingStretching",
          messageKey: "insights.feedingStretchingMsg",
          messageValues: {
            oldInterval: round1(prevAvg / 60),
            newInterval: round1(curAvg / 60),
          },
          source: "AAP",
        });
      }
    }
  }

  if (insights.length >= 2) return insights;

  // Rule 3: Growth percentile tracking
  if (latestGrowth?.weight_percentile !== null && latestGrowth?.weight_percentile !== undefined) {
    insights.push({
      id: "growth-percentile",
      type: "info",
      titleKey: "insights.growthTracking",
      messageKey: "insights.growthTrackingMsg",
      messageValues: {
        percentile: Math.round(latestGrowth.weight_percentile),
      },
      source: "WHO",
    });
  }

  if (insights.length >= 2) return insights;

  // Rule 4: Diaper output healthy (babies under 6 months, avg >= 6/day)
  if (babyAgeMonths < 6) {
    const avgDiapers = avgOverDays(recentSummaries, (s) => s.diaperCount, 7);
    if (avgDiapers !== null && avgDiapers >= 6) {
      insights.push({
        id: "diaper-healthy",
        type: "positive",
        titleKey: "insights.diaperHealthy",
        messageKey: "insights.diaperHealthyMsg",
        messageValues: {
          count: round1(avgDiapers),
        },
        source: "AAP",
      });
    }
  }

  if (insights.length >= 2) return insights;

  // Rule 5: Feeding frequency age-appropriate
  const avgFeeds = avgOverDays(recentSummaries, (s) => s.feedCount, 7);
  if (avgFeeds !== null && avgFeeds > 0) {
    const feedRange = getFeedRange(babyAgeMonths);
    if (avgFeeds >= feedRange.min && avgFeeds <= feedRange.max) {
      insights.push({
        id: "feeding-normal",
        type: "positive",
        titleKey: "insights.feedingNormal",
        messageKey: "insights.feedingNormalMsg",
        messageValues: {
          avg: round1(avgFeeds),
          min: feedRange.min,
          max: feedRange.max,
        },
        source: "AAP",
      });
    }
  }

  return insights.slice(0, 2);
}
