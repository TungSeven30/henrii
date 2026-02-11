"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

export function useDarkMode() {
  const checkDarkMode = useUiStore((state) => state.checkDarkMode);
  const darkModeSchedule = useUiStore((state) => state.darkModeSchedule);

  useEffect(() => {
    // Initial check
    checkDarkMode();

    // Re-check every 60 seconds
    const interval = setInterval(checkDarkMode, 60_000);

    return () => clearInterval(interval);
  }, [checkDarkMode, darkModeSchedule]);
}
