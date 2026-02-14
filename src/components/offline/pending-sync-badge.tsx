"use client";

import { useOfflineStore } from "@/stores/offline-store";

export function PendingSyncBadge() {
  const pendingCount = useOfflineStore((state) => state.pendingCount);
  const isSyncing = useOfflineStore((state) => state.isSyncing);
  const isOnline = useOfflineStore((state) => state.isOnline);

  if (pendingCount === 0 && isOnline) {
    return null;
  }

  return (
    <div
      data-testid="pending-sync-badge"
      className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm shadow-sm"
    >
      <p className="font-semibold">
        {pendingCount > 0 ? `${pendingCount} pending sync` : "All changes synced"}
      </p>
      <p className="text-muted-foreground">
        {isOnline ? (isSyncing ? "Syncing queued events..." : "Waiting for next sync pass") : "Offline mode is active"}
      </p>
    </div>
  );
}
