"use client";

<<<<<<< HEAD
=======
import { useMemo } from "react";
>>>>>>> security-audit-2026-02-11
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useDuplicateStore } from "@/stores/duplicate-store";

export function SyncStatus() {
  const t = useTranslations("sync");
<<<<<<< HEAD
  const unresolved = useDuplicateStore((s) => s.getUnresolved());
=======
  const flags = useDuplicateStore((s) => s.flags);
  const unresolved = useMemo(
    () => flags.filter((flag) => !flag.resolved),
    [flags],
  );
>>>>>>> security-audit-2026-02-11

  if (unresolved.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-henrii-amber/20 text-sm">
      <AlertTriangle className="size-4 text-henrii-amber" />
      <span>{t("duplicatesDetected", { count: unresolved.length })}</span>
    </div>
  );
}
