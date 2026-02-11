import { create } from "zustand";

type OfflineStore = {
  pendingCount: number;
  isSyncing: boolean;
  isOnline: boolean;
  setPendingCount: (count: number) => void;
  setSyncing: (syncing: boolean) => void;
  setOnline: (online: boolean) => void;
};

export const useOfflineStore = create<OfflineStore>((set) => ({
  pendingCount: 0,
  isSyncing: false,
  isOnline: true,
  setPendingCount: (count) => set({ pendingCount: count }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setOnline: (isOnline) => set({ isOnline }),
}));
