/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUiStore } from "./ui-store";

function resetUiStore() {
  useUiStore.setState({
    activeView: "dashboard",
    themeSchedule: {
      startHour: 7,
      endHour: 19,
    },
    darkModeSchedule: {
      start: "19:00",
      end: "07:00",
    },
    darkModePreference: "auto",
    isDarkMode: false,
    unitSystem: "imperial",
    fabOpen: false,
  });
  document.documentElement.classList.remove("dark");
  document.documentElement.dataset.theme = "light";
  document.cookie = "dark_mode_schedule=;path=/;max-age=0";
}

describe("ui-store", () => {
  beforeEach(() => {
    resetUiStore();
    vi.useRealTimers();
  });

  it("clamps theme schedule hours and syncs dark-mode schedule cookie", () => {
    useUiStore.getState().setThemeSchedule({
      startHour: -5,
      endHour: 28,
    });

    const state = useUiStore.getState();
    expect(state.themeSchedule).toEqual({
      startHour: 0,
      endHour: 23,
    });
    expect(state.darkModeSchedule).toEqual({
      start: "23:00",
      end: "00:00",
    });
    expect(document.cookie).toContain("dark_mode_schedule=");
  });

  it("applies dark mode class and data-theme when preference is dark", () => {
    useUiStore.getState().setDarkModePreference("dark");

    const state = useUiStore.getState();
    expect(state.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("evaluates auto preference against configured dark window", () => {
    vi.useFakeTimers();
    const midday = new Date();
    midday.setHours(12, 0, 0, 0);
    vi.setSystemTime(midday);

    useUiStore.getState().setDarkModeSchedule({
      start: "00:00",
      end: "23:59",
    });
    useUiStore.getState().setDarkModePreference("auto");
    useUiStore.getState().checkDarkMode();
    expect(useUiStore.getState().isDarkMode).toBe(true);

    useUiStore.getState().setDarkModeSchedule({
      start: "23:00",
      end: "23:30",
    });
    useUiStore.getState().checkDarkMode();
    expect(useUiStore.getState().isDarkMode).toBe(false);
  });

  it("toggles and closes the FAB state", () => {
    useUiStore.getState().toggleFab();
    expect(useUiStore.getState().fabOpen).toBe(true);

    useUiStore.getState().closeFab();
    expect(useUiStore.getState().fabOpen).toBe(false);
  });
});
