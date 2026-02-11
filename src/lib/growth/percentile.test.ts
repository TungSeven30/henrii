import { describe, expect, it } from "vitest";
import {
  calculateAgeInDays,
  calculateGrowthPercentile,
  calculateGrowthPercentileFromDates,
  interpolateLms,
  percentileFromZScore,
  type GrowthMetric,
  type GrowthSex,
  type LmsPoint,
} from "./percentile";
import { whoGrowthTables } from "./who-growth-tables";

function measurementFromZScore(lms: LmsPoint, zScore: number): number {
  if (lms.l === 0) {
    return lms.m * Math.exp(lms.s * zScore);
  }

  return lms.m * Math.pow(1 + lms.l * lms.s * zScore, 1 / lms.l);
}

describe("growth percentile engine", () => {
  it("calculates age in days from birth and measured dates", () => {
    const ageDays = calculateAgeInDays("2026-01-01", "2026-02-10");
    expect(ageDays).toBe(40);
  });

  it("linearly interpolates LMS values between points", () => {
    const points = whoGrowthTables.weight_for_age.male;
    const lms = interpolateLms(points, 45);

    expect(lms.ageDays).toBe(45);
    expect(lms.m).toBeCloseTo(5.05, 4);
  });

  it("clamps LMS interpolation below first point", () => {
    const points = whoGrowthTables.length_for_age.female;
    const lms = interpolateLms(points, -10);

    expect(lms.ageDays).toBe(0);
    expect(lms.m).toBeCloseTo(49.1, 4);
  });

  it("clamps LMS interpolation above last point", () => {
    const points = whoGrowthTables.head_circumference_for_age.male;
    const lms = interpolateLms(points, 999);

    expect(lms.ageDays).toBe(120);
    expect(lms.m).toBeCloseTo(41.6, 4);
  });

  const medianCases: Array<{ metric: GrowthMetric; sex: GrowthSex; ageDays: number }> = [
    { metric: "weight_for_age", sex: "male", ageDays: 0 },
    { metric: "weight_for_age", sex: "female", ageDays: 60 },
    { metric: "length_for_age", sex: "male", ageDays: 30 },
    { metric: "length_for_age", sex: "female", ageDays: 120 },
    { metric: "head_circumference_for_age", sex: "male", ageDays: 90 },
    { metric: "head_circumference_for_age", sex: "female", ageDays: 0 },
  ];

  for (const testCase of medianCases) {
    it(`returns ~50th percentile at LMS median for ${testCase.metric}/${testCase.sex}/${testCase.ageDays}d`, () => {
      const lms = interpolateLms(whoGrowthTables[testCase.metric][testCase.sex], testCase.ageDays);
      const result = calculateGrowthPercentile({
        tables: whoGrowthTables,
        metric: testCase.metric,
        sex: testCase.sex,
        ageDays: testCase.ageDays,
        measurement: lms.m,
      });

      expect(result.percentile).toBeCloseTo(50, 1);
      expect(result.zScore).toBeCloseTo(0, 5);
    });
  }

  it("returns ~84th percentile for +1 SD", () => {
    const metric: GrowthMetric = "weight_for_age";
    const sex: GrowthSex = "male";
    const lms = interpolateLms(whoGrowthTables[metric][sex], 75);
    const measurement = measurementFromZScore(lms, 1);

    const result = calculateGrowthPercentile({
      tables: whoGrowthTables,
      metric,
      sex,
      ageDays: 75,
      measurement,
    });

    expect(result.zScore).toBeCloseTo(1, 2);
    expect(result.percentile).toBeCloseTo(percentileFromZScore(1), 1);
  });

  it("returns ~16th percentile for -1 SD", () => {
    const metric: GrowthMetric = "length_for_age";
    const sex: GrowthSex = "female";
    const lms = interpolateLms(whoGrowthTables[metric][sex], 45);
    const measurement = measurementFromZScore(lms, -1);

    const result = calculateGrowthPercentile({
      tables: whoGrowthTables,
      metric,
      sex,
      ageDays: 45,
      measurement,
    });

    expect(result.zScore).toBeCloseTo(-1, 2);
    expect(result.percentile).toBeCloseTo(percentileFromZScore(-1), 1);
  });

  it("calculates percentile using date inputs", () => {
    const result = calculateGrowthPercentileFromDates({
      tables: whoGrowthTables,
      metric: "head_circumference_for_age",
      sex: "male",
      dateOfBirthIso: "2026-01-01",
      measuredAtIso: "2026-03-02",
      measurement: interpolateLms(
        whoGrowthTables.head_circumference_for_age.male,
        60,
      ).m,
    });

    expect(result.ageDays).toBe(60);
    expect(result.percentile).toBeCloseTo(50, 1);
  });
});
