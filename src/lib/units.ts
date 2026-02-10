export type UnitSystem = "imperial" | "metric";

// ---------------------------------------------------------------------------
// Weight (DB stores grams)
// ---------------------------------------------------------------------------

/** Display weight for UI text (history lists, tooltips). Imperial uses "X lb Y oz". */
export function gramsToDisplay(
  grams: number,
  system: UnitSystem,
): { value: string; unit: string } {
  if (system === "imperial") {
    const totalOz = grams / 28.3495;
    const lb = Math.floor(totalOz / 16);
    const oz = totalOz % 16;
    return { value: `${lb} lb ${oz.toFixed(1)} oz`, unit: "" };
  }
  return { value: (grams / 1000).toFixed(1), unit: "kg" };
}

/** Display weight as a single decimal number for chart axes. Imperial returns lb. */
export function gramsToChartValue(grams: number, system: UnitSystem): number {
  if (system === "imperial") return grams / 453.592;
  return grams / 1000;
}

/** Chart axis unit label. */
export function weightChartUnit(system: UnitSystem): string {
  return system === "imperial" ? "lb" : "kg";
}

/** Convert a user-entered value back to grams. */
export function displayToGrams(
  value: number,
  inputUnit: "lb" | "oz" | "kg" | "g",
): number {
  switch (inputUnit) {
    case "lb":
      return value * 453.592;
    case "oz":
      return value * 28.3495;
    case "kg":
      return value * 1000;
    case "g":
      return value;
  }
}

// ---------------------------------------------------------------------------
// Length (DB stores cm)
// ---------------------------------------------------------------------------

export function cmToDisplay(
  cm: number,
  system: UnitSystem,
): { value: string; unit: string } {
  if (system === "imperial") {
    const inches = cm / 2.54;
    return { value: inches.toFixed(1), unit: "in" };
  }
  return { value: cm.toFixed(1), unit: "cm" };
}

export function cmToChartValue(cm: number, system: UnitSystem): number {
  if (system === "imperial") return cm / 2.54;
  return cm;
}

export function lengthChartUnit(system: UnitSystem): string {
  return system === "imperial" ? "in" : "cm";
}

export function displayToCm(value: number, system: UnitSystem): number {
  if (system === "imperial") return value * 2.54;
  return value;
}

// ---------------------------------------------------------------------------
// Volume (DB stores ml)
// ---------------------------------------------------------------------------

export function mlToDisplay(
  ml: number,
  system: UnitSystem,
): { value: string; unit: string } {
  if (system === "imperial") {
    const flOz = ml / 29.5735;
    return { value: flOz.toFixed(1), unit: "fl oz" };
  }
  return { value: ml.toFixed(0), unit: "ml" };
}

export function displayToMl(value: number, system: UnitSystem): number {
  if (system === "imperial") return value * 29.5735;
  return value;
}
