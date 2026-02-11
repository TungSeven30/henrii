import type { ThemeSchedule } from "@/stores/ui-store";

export const THEME_COOKIE_NAME = "henrii_theme_schedule";

export function shouldUseDarkTheme(schedule: ThemeSchedule, date = new Date()) {
  const nowHour = date.getHours();
  return nowHour >= schedule.endHour || nowHour < schedule.startHour;
}

export function writeThemeCookie(schedule: ThemeSchedule) {
  if (typeof document === "undefined") {
    return;
  }

  const encoded = encodeURIComponent(
    JSON.stringify({
      startHour: schedule.startHour,
      endHour: schedule.endHour,
    }),
  );

  document.cookie = `${THEME_COOKIE_NAME}=${encoded}; path=/; max-age=31536000; samesite=lax`;
}
