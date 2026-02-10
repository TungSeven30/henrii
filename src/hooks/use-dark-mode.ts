"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function useDarkMode() {
  const { checkDarkMode, darkModeSchedule } = useUIStore();

  useEffect(() => {
    // Initial check
    checkDarkMode();

    // Re-check every 60 seconds
    const interval = setInterval(checkDarkMode, 60_000);

    return () => clearInterval(interval);
  }, [checkDarkMode, darkModeSchedule]);
}
