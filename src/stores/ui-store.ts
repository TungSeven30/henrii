import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UnitSystem } from "@/lib/units/system";

export type DashboardView = "dashboard" | "timeline";

export type ThemeSchedule = {
  startHour: number;
  endHour: number;
};

export type DarkModeSchedule = {
  start: string;
  end: string;
};

export type DarkModePreference = "auto" | "light" | "dark";

const DEFAULT_SCHEDULE: ThemeSchedule = {
  startHour: 7,
  endHour: 19,
};

const DEFAULT_DARK_SCHEDULE: DarkModeSchedule = {
  start: "19:00",
  end: "07:00",
};

function clampHour(value: number) {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(23, Math.max(0, Math.round(value)));
}

function parseTimeToMinutes(value: string) {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number.parseInt(hoursRaw ?? "0", 10);
  const minutes = Number.parseInt(minutesRaw ?? "0", 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return clampHour(hours) * 60 + Math.max(0, Math.min(59, minutes));
}

function syncDarkModeCookie(schedule: DarkModeSchedule) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `dark_mode_schedule=${JSON.stringify(schedule)};path=/;max-age=31536000;samesite=lax`;
}

function isInDarkWindow(schedule: DarkModeSchedule): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeToMinutes(schedule.start);
  const endMinutes = parseTimeToMinutes(schedule.end);

  if (startMinutes === endMinutes) {
    return true;
  }

  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

type UiStore = {
  activeView: DashboardView;
  themeSchedule: ThemeSchedule;
  darkModeSchedule: DarkModeSchedule;
  darkModePreference: DarkModePreference;
  isDarkMode: boolean;
  unitSystem: UnitSystem;
  fabOpen: boolean;
  isFabOpen: boolean;
  setActiveView: (view: DashboardView) => void;
  setThemeSchedule: (schedule: ThemeSchedule) => void;
  setDarkModeSchedule: (schedule: DarkModeSchedule) => void;
  setDarkModePreference: (pref: DarkModePreference) => void;
  setUnitSystem: (unitSystem: UnitSystem) => void;
  setFabOpen: (open: boolean) => void;
  toggleFab: () => void;
  closeFab: () => void;
  setIsDarkMode: (isDark: boolean) => void;
  checkDarkMode: () => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      activeView: "dashboard",
      themeSchedule: DEFAULT_SCHEDULE,
      darkModeSchedule: DEFAULT_DARK_SCHEDULE,
      darkModePreference: "auto",
      isDarkMode: false,
      unitSystem: "imperial",
      fabOpen: false,
      isFabOpen: false,
      setActiveView: (activeView) => set({ activeView }),
      setThemeSchedule: (themeSchedule) => {
        const startHour = clampHour(themeSchedule.startHour);
        const endHour = clampHour(themeSchedule.endHour);
        const darkSchedule = {
          start: `${endHour.toString().padStart(2, "0")}:00`,
          end: `${startHour.toString().padStart(2, "0")}:00`,
        };

        set({
          themeSchedule: {
            startHour,
            endHour,
          },
          darkModeSchedule: darkSchedule,
        });
        syncDarkModeCookie(darkSchedule);
      },
      setDarkModeSchedule: (darkModeSchedule) => {
        set({ darkModeSchedule });
        syncDarkModeCookie(darkModeSchedule);
      },
      setDarkModePreference: (darkModePreference) => {
        set({ darkModePreference });
        get().checkDarkMode();
      },
      setIsDarkMode: (isDarkMode) => {
        set({ isDarkMode });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", isDarkMode);
          document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
        }
      },
      checkDarkMode: () => {
        const { darkModePreference, darkModeSchedule } = get();

        if (darkModePreference === "dark") {
          get().setIsDarkMode(true);
          return;
        }

        if (darkModePreference === "light") {
          get().setIsDarkMode(false);
          return;
        }

        get().setIsDarkMode(isInDarkWindow(darkModeSchedule));
      },
      setUnitSystem: (unitSystem) => set({ unitSystem }),
      setFabOpen: (fabOpen) => set({ fabOpen, isFabOpen: fabOpen }),
      toggleFab: () =>
        set((state) => ({
          fabOpen: !state.fabOpen,
          isFabOpen: !state.fabOpen,
        })),
      closeFab: () => set({ fabOpen: false, isFabOpen: false }),
    }),
    {
      name: "henrii-ui-store",
      partialize: (state) => ({
        activeView: state.activeView,
        themeSchedule: state.themeSchedule,
        darkModeSchedule: state.darkModeSchedule,
        darkModePreference: state.darkModePreference,
        unitSystem: state.unitSystem,
      }),
    },
  ),
);

export const useUIStore = useUiStore;
