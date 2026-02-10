"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Sync orchestration is handled by OfflineSyncProvider.
 * This hook keeps parity with the henrii-c API and refreshes Server Components on focus.
 */
export function useSync() {
  const router = useRouter();

  useEffect(() => {
    const handleFocus = () => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        router.refresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [router]);
}
