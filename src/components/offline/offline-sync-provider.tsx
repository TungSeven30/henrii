"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { countQueuedEvents, listQueuedEvents, removeQueuedEvent } from "@/lib/offline/queue-db";
import { useOfflineStore } from "@/stores/offline-store";

const SYNC_INTERVAL_MS = 15000;
const NON_RETRYABLE_STATUSES = new Set([400, 403, 404, 409, 410, 422]);

export function OfflineSyncProvider() {
  const router = useRouter();
  const inFlight = useRef(false);
  const lastRefreshAt = useRef(0);
  const setPendingCount = useOfflineStore((state) => state.setPendingCount);
  const setSyncing = useOfflineStore((state) => state.setSyncing);
  const setIsOnline = useOfflineStore((state) => state.setIsOnline);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await countQueuedEvents();
      setPendingCount(count);
    } catch {
      setPendingCount(0);
    }
  }, [setPendingCount]);

  const refreshServerData = useCallback(
    (force = false) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }

      const now = Date.now();
      if (!force && now - lastRefreshAt.current < 5000) {
        return;
      }

      lastRefreshAt.current = now;
      router.refresh();
    },
    [router],
  );

  const syncNow = useCallback(async () => {
    if (inFlight.current || typeof navigator === "undefined" || !navigator.onLine) {
      return;
    }

    inFlight.current = true;
    setSyncing(true);

    try {
      const queuedEvents = await listQueuedEvents();
      let syncedAnyEvent = false;

      for (const event of queuedEvents) {
        const payload =
          "endpoint" in (event.payload as Record<string, unknown>)
            ? event.payload
            : ({
                endpoint: "/api/events/log",
                body: event.payload,
              } as const);

        const response = await fetch(payload.endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload.body),
        }).catch(() => null);

        if (!response) {
          continue;
        }

        if (!response.ok) {
          if (NON_RETRYABLE_STATUSES.has(response.status)) {
            await removeQueuedEvent(event.id);
            syncedAnyEvent = true;
          }
          continue;
        }

        await removeQueuedEvent(event.id);
        syncedAnyEvent = true;
      }

      await refreshPendingCount();
      if (syncedAnyEvent) {
        router.refresh();
      }
    } finally {
      setSyncing(false);
      inFlight.current = false;
    }
  }, [refreshPendingCount, router, setSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void syncNow();
      refreshServerData(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncNow();
        refreshServerData(true);
      }
    };

    const handleFocus = () => {
      void syncNow();
      refreshServerData(true);
    };

    setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    void refreshPendingCount();
    void syncNow();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const timer = window.setInterval(() => {
      void syncNow();
      if (document.visibilityState === "visible") {
        refreshServerData();
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(timer);
    };
  }, [refreshPendingCount, refreshServerData, setIsOnline, syncNow]);

  return null;
}
