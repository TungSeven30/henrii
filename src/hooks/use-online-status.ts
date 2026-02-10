"use client";

import { useEffect } from "react";
import { useOfflineStore } from "@/stores/offline-store";

export function useOnlineStatus() {
  const setOnline = useOfflineStore((s) => s.setOnline);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial state
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline]);
}
