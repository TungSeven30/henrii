export type UnitSystem = "imperial" | "metric";

export const UNIT_SYSTEM_COOKIE_NAME = "henrii_unit_system";

const KG_TO_LB = 2.2046226218;
const CM_TO_IN = 0.3937007874;

export function parseUnitSystem(value: string | null | undefined): UnitSystem {
  if (value === "metric") {
    return "metric";
  }

  return "imperial";
}

export function writeUnitSystemCookie(unitSystem: UnitSystem) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${UNIT_SYSTEM_COOKIE_NAME}=${unitSystem}; path=/; max-age=31536000; samesite=lax`;
}

export function kgToLb(valueKg: number) {
  return valueKg * KG_TO_LB;
}

export function lbToKg(valueLb: number) {
  return valueLb / KG_TO_LB;
}

export function cmToIn(valueCm: number) {
  return valueCm * CM_TO_IN;
}

export function inToCm(valueInches: number) {
  return valueInches / CM_TO_IN;
}
