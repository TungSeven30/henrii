import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveTimer {
  id: string;
  type: "sleep" | "feeding";
  startedAt: string; // ISO string
  babyId: string;
}

interface TimerStore {
  activeTimers: ActiveTimer[];
  startTimer: (timer: Omit<ActiveTimer, "id">) => string;
  stopTimer: (id: string) => ActiveTimer | undefined;
  getTimersByBaby: (babyId: string) => ActiveTimer[];
  clearAllTimers: () => void;
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      activeTimers: [],
      startTimer: (timer) => {
        const id = crypto.randomUUID();
        const newTimer: ActiveTimer = { ...timer, id };
        set((state) => ({
          activeTimers: [...state.activeTimers, newTimer],
        }));
        return id;
      },
      stopTimer: (id) => {
        const timer = get().activeTimers.find((t) => t.id === id);
        set((state) => ({
          activeTimers: state.activeTimers.filter((t) => t.id !== id),
        }));
        return timer;
      },
      getTimersByBaby: (babyId) => {
        return get().activeTimers.filter((t) => t.babyId === babyId);
      },
      clearAllTimers: () => set({ activeTimers: [] }),
    }),
    {
      name: "henrii-timers",
    },
  ),
);
