"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  featureName: string;
}

export function UpgradePrompt({ featureName }: UpgradePromptProps) {
  const t = useTranslations("paywall");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        setError(true);
        setLoading(false);
        return;
      }

      const data: unknown = await res.json();
      const url =
        typeof data === "object" &&
        data !== null &&
        "url" in data &&
        typeof (data as Record<string, unknown>).url === "string"
          ? (data as Record<string, unknown>).url as string
          : null;

      if (url) {
        window.location.href = url;
      } else {
        setError(true);
        setLoading(false);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 rounded-xl border bg-background/80 backdrop-blur-sm p-8 text-center">
      <div className="flex items-center justify-center size-14 rounded-full bg-henrii-purple/15">
        <Lock className="size-6 text-henrii-purple" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-heading font-bold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <p className="text-sm font-medium text-henrii-purple">
        {t(`features.${featureName}` as
          | "features.analytics"
          | "features.pdfExport"
          | "features.caregiverInvites"
          | "features.growthCharts"
          | "features.emailNotifications")}
      </p>

      <Button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full max-w-xs"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t("upgrading")}
          </>
        ) : (
          t("upgradeButton")
        )}
      </Button>

      {error && (
        <p className="text-xs text-destructive">{t("error")}</p>
      )}
    </div>
  );
}
