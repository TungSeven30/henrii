"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Baby,
  ChevronRight,
  FileText,
  Globe,
  Loader2,
  Monitor,
  Moon,
  Ruler,
  Settings,
  Shield,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { UnitSystem } from "@/lib/units";
import { useBabyStore } from "@/stores/baby-store";
import { useUiStore } from "@/stores/ui-store";
import { Link, useRouter } from "@/i18n/navigation";
import { CaregiverManager } from "@/components/caregivers/caregiver-manager";
import { NotificationPreferences } from "@/components/notifications/notification-preferences";
import { SubscriptionCard } from "@/components/settings/subscription-card";
import { DataExportCard } from "@/components/settings/data-export-card";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SettingsContentProps = {
  userEmail: string | null;
};

export function SettingsContent({ userEmail }: SettingsContentProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const darkModeSchedule = useUiStore((state) => state.darkModeSchedule);
  const setDarkModeSchedule = useUiStore((state) => state.setDarkModeSchedule);
  const darkModePreference = useUiStore((state) => state.darkModePreference);
  const setDarkModePreference = useUiStore((state) => state.setDarkModePreference);
  const unitSystem = useUiStore((state) => state.unitSystem);
  const setUnitSystem = useUiStore((state) => state.setUnitSystem);
  const clearActiveBaby = useBabyStore((state) => state.clearActiveBaby);

  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      clearActiveBaby();
      router.push("/login", { locale });
    } catch {
      toast.error(t("notificationsFailed"));
      setSigningOut(false);
    }
  }

  function handleLanguageChange(newLocale: string) {
    router.replace("/settings", { locale: newLocale });
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-full bg-muted">
          <Settings className="size-5 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-heading font-bold">{t("title")}</h2>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{t("sessionTitle")}</p>
              <p className="text-xs text-muted-foreground">{userEmail ?? "-"}</p>
            </div>
            <Button variant="outline" onClick={() => void handleSignOut()} disabled={signingOut}>
              {signingOut ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("signOut")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Link
            href="/baby"
            className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Baby className="size-5 text-primary" />
              <span className="text-sm font-medium">{t("babyProfile")}</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Moon className="size-5 text-primary" />
            <span className="text-sm font-medium">{t("darkMode")}</span>
          </div>
          <div className="flex gap-2">
            {([
              { key: "light" as const, icon: Sun, label: t("darkModeLight") },
              { key: "auto" as const, icon: Monitor, label: t("darkModeAuto") },
              { key: "dark" as const, icon: Moon, label: t("darkModeDark") },
            ]).map((option) => (
              <button
                key={option.key}
                onClick={() => setDarkModePreference(option.key)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs font-medium transition-colors ${
                  darkModePreference === option.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <option.icon className="size-4" />
                {option.label}
              </button>
            ))}
          </div>
          {darkModePreference === "auto" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t("darkModeStart")}</Label>
                <Input
                  type="time"
                  value={darkModeSchedule.start}
                  onChange={(event) =>
                    setDarkModeSchedule({
                      ...darkModeSchedule,
                      start: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t("darkModeEnd")}</Label>
                <Input
                  type="time"
                  value={darkModeSchedule.end}
                  onChange={(event) =>
                    setDarkModeSchedule({
                      ...darkModeSchedule,
                      end: event.target.value,
                    })
                  }
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Ruler className="size-5 text-primary" />
              <span className="text-sm font-medium">{t("unitSystem")}</span>
            </div>
            <Select
              value={unitSystem}
              onValueChange={(value) => setUnitSystem(value as UnitSystem)}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imperial">{t("imperial")}</SelectItem>
                <SelectItem value="metric">{t("metric")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe className="size-5 text-primary" />
              <span className="text-sm font-medium">{t("language")}</span>
            </div>
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <SubscriptionCard />
      <CaregiverManager />
      <NotificationPreferences />
      <DataExportCard />

      <Card>
        <CardContent className="p-0">
          <Link
            href="/privacy"
            className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="size-5 text-primary" />
              <span className="text-sm font-medium">{t("privacy")}</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Separator />
          <Link
            href="/terms"
            className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-primary" />
              <span className="text-sm font-medium">{t("terms")}</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="space-y-4">
          <DeleteAccountDialog />
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {t("version")} 0.1.0
      </p>

      <p className="text-center text-[11px] text-muted-foreground">{tCommon("appName")}</p>
    </div>
  );
}
