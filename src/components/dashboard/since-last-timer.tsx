"use client";

import { useSyncExternalStore } from "react";

interface SinceLastTimerProps {
  timestamp: string | null;
  warningThresholdMinutes?: number;
}

function formatElapsed(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 1) return "<1m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function useMinuteClock(): number {
  // Returns Date.now() floored to the current minute, re-subscribing every 60s.
  return useSyncExternalStore(
    (callback) => {
      const interval = setInterval(callback, 60_000);
      return () => clearInterval(interval);
    },
    () => Date.now(),
    () => Date.now()
  );
}

export function SinceLastTimer({
  timestamp,
  warningThresholdMinutes,
}: SinceLastTimerProps) {
  const now = useMinuteClock();

  if (!timestamp) return <span>-</span>;

  const elapsed = now - new Date(timestamp).getTime();

  const isWarning =
    warningThresholdMinutes !== undefined &&
    elapsed >= warningThresholdMinutes * 60_000;

  return (
    <span className={isWarning ? "text-henrii-amber font-semibold" : ""}>
      {formatElapsed(elapsed)}
    </span>
  );
}
