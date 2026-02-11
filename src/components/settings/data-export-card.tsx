"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DataExportCard() {
  const t = useTranslations("dataExport");
  const [downloading, setDownloading] = useState(false);

  async function handleExport() {
    setDownloading(true);

    try {
      const res = await fetch("/api/export/data");

      if (res.status === 429) {
        toast.error(t("rateLimited"));
        return;
      }

      if (!res.ok) {
        toast.error(t("error"));
        return;
      }

      const blob = await res.blob();

      // Extract filename from Content-Disposition header, fallback to default
      const disposition = res.headers.get("Content-Disposition");
      let filename = "henrii-export.json";
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Download className="size-5 text-primary" />
          <span className="text-sm font-medium">{t("title")}</span>
        </div>

        <p className="text-xs text-muted-foreground">{t("description")}</p>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleExport}
          disabled={downloading}
        >
          {downloading && <Loader2 className="animate-spin" />}
          {downloading ? t("downloading") : t("downloadButton")}
        </Button>
      </CardContent>
    </Card>
  );
}
