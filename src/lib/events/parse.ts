import type { DiaperType, FeedingType } from "./types";

export function parseIsoTimestamp(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export function isFeedingType(value: unknown): value is FeedingType {
  return value === "breast" || value === "bottle" || value === "solid";
}

export function isDiaperType(value: unknown): value is DiaperType {
  return value === "wet" || value === "dirty" || value === "mixed";
}

export function normalizeDiaperType(raw: string): DiaperType {
  if (raw === "both") {
    return "mixed";
  }

  return isDiaperType(raw) ? raw : "wet";
}

export function displayDiaperType(dbType: string): "wet" | "dirty" | "both" {
  if (dbType === "mixed") {
    return "both";
  }

  return dbType === "dirty" ? "dirty" : "wet";
}
