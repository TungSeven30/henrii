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

function isSameBaby(a: Baby | null, b: Baby | null) {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return (
    a.id === b.id &&
    a.name === b.name &&
    a.date_of_birth === b.date_of_birth &&
    (a.gender ?? null) === (b.gender ?? null) &&
    (a.sex ?? null) === (b.sex ?? null) &&
    a.country_code === b.country_code &&
    a.timezone === b.timezone &&
    (a.photo_url ?? null) === (b.photo_url ?? null) &&
    (a.owner_id ?? null) === (b.owner_id ?? null)
  );
}

function areSameBabies(a: Baby[], b: Baby[]) {
  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  return a.every((baby, index) => isSameBaby(baby, b[index] ?? null));
}
export const useBabyStore = create<BabyStore>()(
  persist(
    (set, get) => ({
      activeBabyId: null,
      activeBaby: null,
      allBabies: [],
      hydrated: false,
      setActiveBabyId: (babyId) => {
        set((state) => {
          const nextActiveBaby = resolveActiveBaby(state.allBabies, babyId) ?? state.activeBaby;
          if (state.activeBabyId === babyId && isSameBaby(state.activeBaby, nextActiveBaby)) {
            return state;
          }

          return {
            activeBabyId: babyId,
            activeBaby: nextActiveBaby,
          };
        });
      },
      setActiveBaby: (baby) => {
        set((state) => {
          const allBabies = state.allBabies.some((item) => item.id === baby.id)
            ? state.allBabies.map((item) => (item.id === baby.id ? baby : item))
            : [...state.allBabies, baby];

          if (
            state.activeBabyId === baby.id &&
            isSameBaby(state.activeBaby, baby) &&
            areSameBabies(state.allBabies, allBabies)
          ) {
            return state;
          }

          return {
            activeBabyId: baby.id,
            activeBaby: baby,
            allBabies,
          };
        });
      },
      setAllBabies: (allBabies) => {
        const activeBabyId = get().activeBabyId;
        set((state) => {
          const nextActiveBaby = resolveActiveBaby(allBabies, activeBabyId);

          if (
            areSameBabies(state.allBabies, allBabies) &&
            isSameBaby(state.activeBaby, nextActiveBaby)
          ) {
            return state;
          }

          return {
            allBabies,
            activeBaby: nextActiveBaby,
          };
        });
      },
      clearActiveBaby: () => set({ activeBabyId: null, activeBaby: null, allBabies: [] }),
      hydrateFromProfile: ({ defaultBabyId, caregiverBabyIds = [] }) => {
        const firstAvailableBabyId = defaultBabyId ?? caregiverBabyIds[0] ?? null;
        set((state) => {
          const nextActiveBaby = resolveActiveBaby(state.allBabies, firstAvailableBabyId);
          if (
            state.activeBabyId === firstAvailableBabyId &&
            isSameBaby(state.activeBaby, nextActiveBaby) &&
            state.hydrated
          ) {
            return state;
          }

          return {
            activeBabyId: firstAvailableBabyId,
            activeBaby: nextActiveBaby,
            hydrated: true,
          };
        });
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
