import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface DuplicateFlag {
  id: string;
  tableName: string;
  eventId: string;
  nearbyIds: string[];
  timestamp: string;
  resolved: boolean;
  createdAt: string;
}

interface DuplicateStore {
  flags: DuplicateFlag[];
  addFlag: (
    flag: Omit<DuplicateFlag, "id" | "resolved" | "createdAt">,
  ) => void;
  resolveFlag: (id: string) => void;
  getUnresolved: () => DuplicateFlag[];
  clearResolved: () => void;
}

export const useDuplicateStore = create<DuplicateStore>()(
  persist(
    (set, get) => ({
      flags: [],
      addFlag: (flag) => {
        const entry: DuplicateFlag = {
          ...flag,
          id: crypto.randomUUID(),
          resolved: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          flags: [...state.flags, entry],
        }));
      },
      resolveFlag: (id) =>
        set((state) => ({
          flags: state.flags.map((f) =>
            f.id === id ? { ...f, resolved: true } : f,
          ),
        })),
      getUnresolved: () => get().flags.filter((f) => !f.resolved),
      clearResolved: () =>
        set((state) => ({
          flags: state.flags.filter((f) => !f.resolved),
        })),
    }),
    {
      name: "henrii-duplicate-flags",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    },
  ),
);
