"use client";

import { useEffect } from "react";
import { shouldUseDarkTheme, writeThemeCookie } from "@/lib/theme/schedule";
import { writeUnitSystemCookie } from "@/lib/units/system";
import { useUiStore } from "@/stores/ui-store";

const CHECK_INTERVAL_MS = 60_000;

export function ThemeScheduleProvider() {
  const schedule = useUiStore((state) => state.themeSchedule);
  const darkModePreference = useUiStore((state) => state.darkModePreference);
  const checkDarkMode = useUiStore((state) => state.checkDarkMode);
  const unitSystem = useUiStore((state) => state.unitSystem);

  useEffect(() => {
    const applyTheme = () => {
      const dark =
        darkModePreference === "auto"
          ? shouldUseDarkTheme(schedule)
          : darkModePreference === "dark";
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.documentElement.classList.toggle("dark", dark);
    };

    applyTheme();
    checkDarkMode();
    writeThemeCookie(schedule);
    const timer = window.setInterval(applyTheme, CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [checkDarkMode, darkModePreference, schedule]);

  useEffect(() => {
    writeUnitSystemCookie(unitSystem);
  }, [unitSystem]);

  return null;
}
