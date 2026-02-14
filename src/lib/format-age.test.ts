import { describe, expect, it, vi } from "vitest";
import { formatBabyAge } from "./format-age";

describe("formatBabyAge", () => {
  it("returns 0 days for invalid DOB input", () => {
    expect(formatBabyAge("not-a-date")).toEqual({ key: "ageDays", values: { days: 0 } });
  });

  it("returns 0 days for future DOB", () => {
    const now = new Date("2026-02-10T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    expect(formatBabyAge("2026-02-11T00:00:00.000Z")).toEqual({
      key: "ageDays",
      values: { days: 0 },
    });

    vi.useRealTimers();
  });

  it("returns days for babies younger than 28 days", () => {
    const now = new Date("2026-02-10T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    expect(formatBabyAge("2026-02-01T00:00:00.000Z")).toEqual({
      key: "ageDays",
      values: { days: 9 },
    });

    vi.useRealTimers();
  });
});
