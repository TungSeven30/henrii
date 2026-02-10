import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export interface Baby {
  id: string;
  name: string;
  date_of_birth: string;
  gender?: string | null;
  sex?: string | null;
  country_code: string;
  timezone: string;
  photo_url?: string | null;
  owner_id?: string;
}

type BabyHydrationInput = {
  defaultBabyId?: string | null;
  caregiverBabyIds?: string[];
};

type BabyStore = {
  activeBabyId: string | null;
  activeBaby: Baby | null;
  allBabies: Baby[];
  hydrated: boolean;
  setActiveBabyId: (babyId: string | null) => void;
  setActiveBaby: (baby: Baby) => void;
  setAllBabies: (babies: Baby[]) => void;
  clearActiveBaby: () => void;
  hydrateFromProfile: (input: BabyHydrationInput) => void;
  markHydrated: () => void;
  reset: () => void;
};

function resolveActiveBaby(babies: Baby[], babyId: string | null) {
  if (!babyId) {
    return null;
  }

  return babies.find((baby) => baby.id === babyId) ?? null;
}

export const useBabyStore = create<BabyStore>()(
  persist(
    (set, get) => ({
      activeBabyId: null,
      activeBaby: null,
      allBabies: [],
      hydrated: false,
      setActiveBabyId: (babyId) => {
        set((state) => ({
          activeBabyId: babyId,
          activeBaby: resolveActiveBaby(state.allBabies, babyId) ?? state.activeBaby,
        }));
      },
      setActiveBaby: (baby) => {
        set((state) => {
          const allBabies = state.allBabies.some((item) => item.id === baby.id)
            ? state.allBabies.map((item) => (item.id === baby.id ? baby : item))
            : [...state.allBabies, baby];

          return {
            activeBabyId: baby.id,
            activeBaby: baby,
            allBabies,
          };
        });
      },
      setAllBabies: (allBabies) => {
        const activeBabyId = get().activeBabyId;
        set({
          allBabies,
          activeBaby: resolveActiveBaby(allBabies, activeBabyId),
        });
      },
      clearActiveBaby: () => set({ activeBabyId: null, activeBaby: null, allBabies: [] }),
      hydrateFromProfile: ({ defaultBabyId, caregiverBabyIds = [] }) => {
        const firstAvailableBabyId = defaultBabyId ?? caregiverBabyIds[0] ?? null;
        set((state) => ({
          activeBabyId: firstAvailableBabyId,
          activeBaby: resolveActiveBaby(state.allBabies, firstAvailableBabyId),
          hydrated: true,
        }));
      },
      markHydrated: () => set({ hydrated: true }),
      reset: () =>
        set({ activeBabyId: null, activeBaby: null, allBabies: [], hydrated: false }),
    }),
    {
      name: "henrii-active-baby",
      partialize: ({ activeBabyId, activeBaby }) => ({ activeBabyId, activeBaby }),
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }

        const noopStorage: StateStorage = {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };

        return noopStorage;
      }),
    },
  ),
);
