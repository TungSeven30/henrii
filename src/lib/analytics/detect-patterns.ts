import { differenceInHours } from "date-fns";
import type {
  AnalyticsEvents,
  DailySummary,
} from "@/lib/analytics/calculate-summaries";

// --- Pattern types ---

export const PATTERN_TYPES = {
  NO_DIAPER_48H: "NO_DIAPER_48H",
  FEEDING_GAP_INCREASING: "FEEDING_GAP_INCREASING",
  SLEEP_DURATION_DECLINING: "SLEEP_DURATION_DECLINING",
} as const;

export type PatternType = (typeof PATTERN_TYPES)[keyof typeof PATTERN_TYPES];

export type PatternSeverity = "warning" | "info";

export interface PatternData {
  /** Human-readable numbers relevant to this pattern */
  [key: string]: number | string;
}

export interface Pattern {
  type: PatternType;
  severity: PatternSeverity;
  /** Translation key under the "analytics" namespace */
  message: string;
  data: PatternData;
}

/**
 * Detect notable patterns (or problems) across the event data.
 *
 * Current detectors:
 *   1. NO_DIAPER_48H   - no diaper change in the last 48 hours
 *   2. FEEDING_GAP_INCREASING - avg feeding interval up >15% vs prior week
 *   3. SLEEP_DURATION_DECLINING - avg daily sleep down >20% vs prior week
 */
export function detectPatterns(
  events: AnalyticsEvents,
  dailySummaries: DailySummary[],
): Pattern[] {
  const patterns: Pattern[] = [];

  detectNoDiaper48h(events, patterns);
  detectFeedingGapIncreasing(dailySummaries, patterns);
  detectSleepDeclining(dailySummaries, patterns);

  return patterns;
}

// ---- Individual detectors ----

function detectNoDiaper48h(
  events: AnalyticsEvents,
  patterns: Pattern[],
): void {
  if (events.diaperChanges.length === 0) {
    patterns.push({
      type: PATTERN_TYPES.NO_DIAPER_48H,
      severity: "warning",
      message: "noDiaper48h",
      data: { hoursSinceLastChange: "N/A" },
    });
    return;
  }

  const sorted = [...events.diaperChanges].sort(
    (a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime(),
  );

  const lastChange = new Date(sorted[0].changed_at);
  const hoursSince = differenceInHours(new Date(), lastChange);

  if (hoursSince >= 48) {
    patterns.push({
      type: PATTERN_TYPES.NO_DIAPER_48H,
      severity: "warning",
      message: "noDiaper48h",
      data: { hoursSinceLastChange: hoursSince },
    });
  }
}

function detectFeedingGapIncreasing(
  dailySummaries: DailySummary[],
  patterns: Pattern[],
): void {
  if (dailySummaries.length < 8) return;

  const midpoint = Math.floor(dailySummaries.length / 2);
  const previousWeek = dailySummaries.slice(0, midpoint);
  const currentWeek = dailySummaries.slice(midpoint);

  const avgInterval = (days: DailySummary[]): number | null => {
    const intervals = days
      .map((d) => d.avgFeedingIntervalMinutes)
      .filter((v): v is number => v !== null);
    if (intervals.length === 0) return null;
    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  };

  const prevAvg = avgInterval(previousWeek);
  const curAvg = avgInterval(currentWeek);

  if (prevAvg === null || curAvg === null || prevAvg === 0) return;

  const changePercent = ((curAvg - prevAvg) / prevAvg) * 100;

  if (changePercent > 15) {
    patterns.push({
      type: PATTERN_TYPES.FEEDING_GAP_INCREASING,
      severity: "info",
      message: "feedingGapIncreasing",
      data: {
        previousAvgMinutes: Math.round(prevAvg),
        currentAvgMinutes: Math.round(curAvg),
        changePercent: Math.round(changePercent),
      },
    });
  }
}

function detectSleepDeclining(
  dailySummaries: DailySummary[],
  patterns: Pattern[],
): void {
  if (dailySummaries.length < 8) return;

  const midpoint = Math.floor(dailySummaries.length / 2);
  const previousWeek = dailySummaries.slice(0, midpoint);
  const currentWeek = dailySummaries.slice(midpoint);

  const avgSleep = (days: DailySummary[]): number => {
    if (days.length === 0) return 0;
    return (
      days.reduce((sum, d) => sum + d.sleepTotalMinutes, 0) / days.length
    );
  };

  const prevAvg = avgSleep(previousWeek);
  const curAvg = avgSleep(currentWeek);

  if (prevAvg === 0) return;

  const changePercent = ((curAvg - prevAvg) / prevAvg) * 100;

  // Declining means negative change > 20% magnitude
  if (changePercent < -20) {
    patterns.push({
      type: PATTERN_TYPES.SLEEP_DURATION_DECLINING,
      severity: "warning",
      message: "sleepDeclining",
      data: {
        previousAvgHours: +(prevAvg / 60).toFixed(1),
        currentAvgHours: +(curAvg / 60).toFixed(1),
        changePercent: Math.round(Math.abs(changePercent)),
      },
    });
  }
}
