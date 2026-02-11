import { beforeEach, describe, expect, it } from "vitest";
import { useOfflineStore } from "./offline-store";

function resetOfflineStore() {
  useOfflineStore.setState({
    pendingCount: 0,
    isSyncing: false,
    isOnline: true,
  });
}

describe("offline-store", () => {
  beforeEach(() => {
    resetOfflineStore();
  });

  it("updates pending count", () => {
    useOfflineStore.getState().setPendingCount(3);
    expect(useOfflineStore.getState().pendingCount).toBe(3);
  });

  it("tracks syncing state", () => {
    useOfflineStore.getState().setSyncing(true);
    expect(useOfflineStore.getState().isSyncing).toBe(true);
  });

  it("tracks online/offline state", () => {
    useOfflineStore.getState().setOnline(false);
    expect(useOfflineStore.getState().isOnline).toBe(false);
  });
});
