export type BabySex = "male" | "female";

export function isBabySex(value: string | null | undefined): value is BabySex {
  return value === "male" || value === "female";
}

export function normalizeBabySex(
  value: string | null | undefined,
  fallback: BabySex = "male",
): BabySex {
  return isBabySex(value) ? value : fallback;
}
