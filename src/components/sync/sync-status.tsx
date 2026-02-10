"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useDuplicateStore } from "@/stores/duplicate-store";

export function SyncStatus() {
  const t = useTranslations("sync");
  const unresolved = useDuplicateStore((s) => s.getUnresolved());

  if (unresolved.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-henrii-amber/20 text-sm">
      <AlertTriangle className="size-4 text-henrii-amber" />
      <span>{t("duplicatesDetected", { count: unresolved.length })}</span>
    </div>
  );
}
