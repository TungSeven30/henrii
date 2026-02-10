const STORAGE_KEY = "henrii-event-count";

export function incrementEventCount(): number {
  if (typeof window === "undefined") return 0;
  const current = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  const next = current + 1;
  localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

export function getEventCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}
