"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { countQueuedEvents, listQueuedEvents, removeQueuedEvent } from "@/lib/offline/queue-db";
import { useOfflineStore } from "@/stores/offline-store";

const SYNC_INTERVAL_MS = 15000;
const NON_RETRYABLE_STATUSES = new Set([400, 403, 404, 409, 410, 422]);
const MAX_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 2_000;
const RETRY_MAX_DELAY_MS = 60_000;

type SyncRequestPayload = {
  endpoint: "/api/events/log" | "/api/events/mutate";
  body: unknown;
};

function resolveSyncPayload(rawPayload: unknown): SyncRequestPayload {
  if (!rawPayload || typeof rawPayload !== "object") {
    return {
      endpoint: "/api/events/log",
      body: rawPayload,
    };
  }

  const payload = rawPayload as Record<string, unknown>;
  const kindEndpoint =
    payload.kind === "mutate"
      ? "/api/events/mutate"
      : payload.kind === "log"
        ? "/api/events/log"
        : null;
  const explicitEndpoint =
    payload.endpoint === "/api/events/mutate" || payload.endpoint === "/api/events/log"
      ? payload.endpoint
      : null;

  return {
    endpoint: kindEndpoint ?? explicitEndpoint ?? "/api/events/log",
    body: "body" in payload ? payload.body : rawPayload,
  };
}

export function OfflineSyncProvider() {
  const router = useRouter();
  const inFlight = useRef(false);
  const lastRefreshAt = useRef(0);
  const retryState = useRef(new Map<string, { count: number; nextRetryAt: number }>());
  const setPendingCount = useOfflineStore((state) => state.setPendingCount);
  const setSyncing = useOfflineStore((state) => state.setSyncing);
  const setOnline = useOfflineStore((state) => state.setOnline);

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
        const currentRetry = retryState.current.get(event.id) ?? { count: 0, nextRetryAt: 0 };
        if (currentRetry.count >= MAX_RETRIES) {
          continue;
        }

        if (Date.now() < currentRetry.nextRetryAt) {
          continue;
        }

        const payload = resolveSyncPayload(event.payload);

        const response = await fetch(payload.endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload.body),
        }).catch(() => null);

        if (!response || response.status >= 500 || response.status === 429) {
          const nextCount = currentRetry.count + 1;
          const delay = Math.min(RETRY_MAX_DELAY_MS, RETRY_BASE_DELAY_MS * 2 ** (nextCount - 1));
          retryState.current.set(event.id, {
            count: nextCount,
            nextRetryAt: Date.now() + delay,
          });
          continue;
        }

        if (!response.ok) {
          if (NON_RETRYABLE_STATUSES.has(response.status)) {
            await removeQueuedEvent(event.id);
            retryState.current.delete(event.id);
            syncedAnyEvent = true;
            continue;
          }

          const nextCount = currentRetry.count + 1;
          const delay = Math.min(RETRY_MAX_DELAY_MS, RETRY_BASE_DELAY_MS * 2 ** (nextCount - 1));
          retryState.current.set(event.id, {
            count: nextCount,
            nextRetryAt: Date.now() + delay,
          });
          continue;
        }

        await removeQueuedEvent(event.id);
        retryState.current.delete(event.id);
        syncedAnyEvent = true;
      }

      await refreshPendingCount();
      if (syncedAnyEvent) {
        refreshServerData();
      }
    } finally {
      setSyncing(false);
      inFlight.current = false;
    }
  }, [refreshPendingCount, refreshServerData, setSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      retryState.current.clear();
      setOnline(true);
      void syncNow();
      refreshServerData(true);
    };

    const handleOffline = () => {
      setOnline(false);
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

    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
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
  }, [refreshPendingCount, refreshServerData, setOnline, syncNow]);

  return null;
}
