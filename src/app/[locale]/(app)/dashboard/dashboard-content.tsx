"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Baby,
  BarChart3,
  Droplets,
  Moon,
  Plus,
  Repeat,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import type { Insight } from "@/lib/insights/generate-insights";
import { displayDiaperType } from "@/lib/events/parse";
import { useUiStore } from "@/stores/ui-store";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { SinceLastTimer } from "@/components/dashboard/since-last-timer";
import { formatBabyAge } from "@/lib/format-age";
import { FeedForm, type FeedInitialData } from "@/components/log/feed-form";
import { SleepForm, type SleepInitialData } from "@/components/log/sleep-form";
import { DiaperForm, type DiaperInitialData } from "@/components/log/diaper-form";
import { FabMenu } from "@/components/fab/fab-menu";
import { ActiveTimerBadge } from "@/components/log/active-timer-badge";
import { PendingSyncBadge } from "@/components/offline/pending-sync-badge";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { SyncStatus } from "@/components/sync/sync-status";

interface BabyData {
  id: string;
  name: string;
  date_of_birth: string;
  sex: string | null;
  country_code: string;
  timezone: string;
  photo_url?: string | null;
  owner_id?: string;
}

interface LastFeedRecord {
  id: string;
  feeding_type: string;
  amount_ml: number | null;
  started_at: string;
  notes: string | null;
}

interface LastSleepRecord {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
}

interface LastDiaperRecord {
  id: string;
  changed_at: string;
  change_type: string;
  notes: string | null;
}

export type DashboardTimelineEvent = {
  id: string;
  type: "feeding" | "sleep" | "diaper";
  happenedAt: string;
  summary: string;
};

interface DashboardContentProps {
  baby: BabyData;
  todayCounts: {
    feeds: number;
    sleeps: number;
    diapers: number;
  };
  lastEvents: {
    lastFeed: string | null;
    lastSleep: string | null;
    lastDiaper: string | null;
  };
  lastFeedData: LastFeedRecord | null;
  lastSleepData: LastSleepRecord | null;
  lastDiaperData: LastDiaperRecord | null;
  insights: Insight[];
  timelineEvents: DashboardTimelineEvent[];
  initialView: "dashboard" | "timeline";
  totalEventCount: number;
}

type TimelineFilter = "all" | "feeding" | "sleep" | "diaper";

function getQuickFeedLabel(
  data: LastFeedRecord,
  t: ReturnType<typeof useTranslations<"quickLog">>,
): string {
  if (data.feeding_type === "bottle" && data.amount_ml) {
    return t("bottleMl", { amount: data.amount_ml });
  }
  if (data.feeding_type === "breast") return t("breast");
  if (data.feeding_type === "solid") return t("solid");
  return t("bottleMl", { amount: data.amount_ml ?? "?" });
}

function getQuickDiaperLabel(
  data: LastDiaperRecord,
  t: ReturnType<typeof useTranslations<"quickLog">>,
): string {
  const key = displayDiaperType(data.change_type);
  return t(key);
}

function getQuickSleepLabel(
  data: LastSleepRecord,
  t: ReturnType<typeof useTranslations<"quickLog">>,
): string {
  if (data.duration_minutes) {
    return t("sleepMin", { duration: data.duration_minutes });
  }
  return t("sleepMin", { duration: "?" });
}

export function DashboardContent({
  baby,
  todayCounts,
  lastEvents,
  lastFeedData,
  lastSleepData,
  lastDiaperData,
  insights,
  timelineEvents,
  initialView,
  totalEventCount,
}: DashboardContentProps) {
  const t = useTranslations("dashboard");
  const tQuick = useTranslations("quickLog");
  const tInsights = useTranslations("insights");
  const activeView = useUiStore((state) => state.activeView);
  const setActiveView = useUiStore((state) => state.setActiveView);

  const [filter, setFilter] = useState<TimelineFilter>("all");

  const [quickFeedOpen, setQuickFeedOpen] = useState(false);
  const [quickSleepOpen, setQuickSleepOpen] = useState(false);
  const [quickDiaperOpen, setQuickDiaperOpen] = useState(false);

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView, setActiveView]);

  const filteredTimeline = useMemo(() => {
    if (filter === "all") {
      return timelineEvents;
    }

    return timelineEvents.filter((event) => event.type === filter);
  }, [filter, timelineEvents]);

  const babyAge = formatBabyAge(baby.date_of_birth);

  const summaryCards = [
    {
      label: t("feeds"),
      count: todayCounts.feeds,
      icon: UtensilsCrossed,
      color: "bg-henrii-pink/20 text-henrii-pink",
      iconColor: "text-henrii-pink",
    },
    {
      label: t("sleeps"),
      count: todayCounts.sleeps,
      icon: Moon,
      color: "bg-henrii-blue/20 text-henrii-blue",
      iconColor: "text-henrii-blue",
    },
    {
      label: t("diapers"),
      count: todayCounts.diapers,
      icon: Droplets,
      color: "bg-henrii-green/20 text-henrii-green",
      iconColor: "text-henrii-green",
    },
  ];

  const lastEventItems = [
    {
      label: t("lastFeed"),
      timestamp: lastEvents.lastFeed,
      warningThresholdMinutes: 240,
      icon: UtensilsCrossed,
      iconColor: "text-henrii-pink",
    },
    {
      label: t("lastSleep"),
      timestamp: lastEvents.lastSleep,
      warningThresholdMinutes: 180,
      icon: Moon,
      iconColor: "text-henrii-blue",
    },
    {
      label: t("lastDiaper"),
      timestamp: lastEvents.lastDiaper,
      warningThresholdMinutes: 300,
      icon: Droplets,
      iconColor: "text-henrii-green",
    },
  ];

  const hasAnyEvents =
    todayCounts.feeds > 0 ||
    todayCounts.sleeps > 0 ||
    todayCounts.diapers > 0 ||
    lastEvents.lastFeed !== null ||
    lastEvents.lastSleep !== null ||
    lastEvents.lastDiaper !== null;

  const hasQuickLogChips =
    lastFeedData !== null ||
    lastSleepData !== null ||
    lastDiaperData !== null;

  const feedInitialData: FeedInitialData | null = lastFeedData
    ? {
        type:
          lastFeedData.feeding_type === "breast" ||
          lastFeedData.feeding_type === "solid"
            ? lastFeedData.feeding_type
            : "bottle",
        amount_ml: lastFeedData.amount_ml,
        amount_description: null,
        started_at: new Date().toISOString(),
        ended_at: null,
        duration_minutes: null,
        notes: lastFeedData.notes,
      }
    : null;

  const sleepInitialData: SleepInitialData | null = lastSleepData
    ? {
        started_at: new Date().toISOString(),
        ended_at: null,
        duration_minutes: null,
        quality: null,
        notes: lastSleepData.notes,
      }
    : null;

  const diaperInitialData: DiaperInitialData | null = lastDiaperData
    ? {
        changed_at: new Date().toISOString(),
        type: displayDiaperType(lastDiaperData.change_type),
        color: null,
        consistency: null,
        notes: lastDiaperData.notes,
      }
    : null;

  return (
    <div className="space-y-6 pb-28">
      <SyncStatus />

      <div className="flex items-center gap-3">
        {baby.photo_url ? (
          <Image
            src={baby.photo_url}
            alt={baby.name}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/20">
            <Baby className="size-5 text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-heading font-bold">{baby.name}</h2>
          <p className="text-sm text-muted-foreground">
            {t(babyAge.key, babyAge.values)}
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-full border border-border bg-card/95 p-1 text-sm shadow-sm">
        <button
          className={`rounded-full px-4 py-1.5 transition ${
            activeView === "dashboard"
              ? "bg-primary font-semibold text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
          onClick={() => setActiveView("dashboard")}
          type="button"
        >
          {t("viewDashboard")}
        </button>
        <button
          className={`rounded-full px-4 py-1.5 transition ${
            activeView === "timeline"
              ? "bg-primary font-semibold text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
          onClick={() => setActiveView("timeline")}
          type="button"
        >
          {t("viewTimeline")}
        </button>
      </div>

      <PendingSyncBadge />

      {activeView === "dashboard" ? (
        <>
          <ActiveTimerBadge />

          <div className="grid grid-cols-3 gap-3">
            {summaryCards.map((card) => (
              <Card key={card.label} className="py-4">
                <CardContent className="flex flex-col items-center gap-2 px-3">
                  <div
                    className={`flex items-center justify-center size-9 rounded-full ${card.color}`}
                  >
                    <card.icon className={`size-4 ${card.iconColor}`} />
                  </div>
                  <span className="text-2xl font-bold font-mono">{card.count}</span>
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasAnyEvents ? (
            <Card className="py-4">
              <CardContent className="space-y-3 px-4">
                {lastEventItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className={`size-4 ${item.iconColor}`} />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium">
                      <SinceLastTimer
                        timestamp={item.timestamp}
                        warningThresholdMinutes={item.warningThresholdMinutes}
                      />
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="py-8">
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center justify-center size-12 rounded-full bg-muted">
                  <Plus className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">{t("noEvents")}</p>
                <p className="text-xs text-muted-foreground">{t("noEventsSubtitle")}</p>
              </CardContent>
            </Card>
          )}

          {hasQuickLogChips ? (
            <div className="flex flex-wrap gap-2">
              {lastFeedData ? (
                <button
                  onClick={() => setQuickFeedOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-henrii-pink/30 bg-henrii-pink/10 px-3 py-1.5 text-sm font-medium text-henrii-pink transition-colors hover:bg-henrii-pink/20"
                >
                  <Repeat className="size-3.5" />
                  {tQuick("quickLog")}: {getQuickFeedLabel(lastFeedData, tQuick)}
                </button>
              ) : null}
              {lastSleepData ? (
                <button
                  onClick={() => setQuickSleepOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-henrii-blue/30 bg-henrii-blue/10 px-3 py-1.5 text-sm font-medium text-henrii-blue transition-colors hover:bg-henrii-blue/20"
                >
                  <Repeat className="size-3.5" />
                  {tQuick("quickLog")}: {getQuickSleepLabel(lastSleepData, tQuick)}
                </button>
              ) : null}
              {lastDiaperData ? (
                <button
                  onClick={() => setQuickDiaperOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-henrii-green/30 bg-henrii-green/10 px-3 py-1.5 text-sm font-medium text-henrii-green transition-colors hover:bg-henrii-green/20"
                >
                  <Repeat className="size-3.5" />
                  {tQuick("quickLog")}: {getQuickDiaperLabel(lastDiaperData, tQuick)}
                </button>
              ) : null}
            </div>
          ) : null}

          {insights.length > 0 ? (
            <div className="flex flex-col gap-3">
              {insights.map((insight) => {
                const bgClass =
                  insight.type === "positive"
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/40"
                    : insight.type === "tip"
                      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40"
                      : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40";
                const iconColor =
                  insight.type === "positive"
                    ? "text-green-600 dark:text-green-400"
                    : insight.type === "tip"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-blue-600 dark:text-blue-400";

                return (
                  <div key={insight.id} className={`rounded-xl border p-3 ${bgClass}`}>
                    <div className="flex gap-2.5">
                      <Sparkles className={`size-4 shrink-0 mt-0.5 ${iconColor}`} />
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-sm font-medium">
                          {tInsights(
                            insight.titleKey.replace("insights.", "") as Parameters<
                              typeof tInsights
                            >[0],
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {tInsights(
                            insight.messageKey.replace("insights.", "") as Parameters<
                              typeof tInsights
                            >[0],
                            insight.messageValues,
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {tInsights("source", { source: insight.source })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Link href="/analytics">
              <Card className="py-4 hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col items-center gap-2 px-3">
                  <div className="flex items-center justify-center size-9 rounded-full bg-henrii-purple/20 text-henrii-purple">
                    <BarChart3 className="size-4" />
                  </div>
                  <span className="text-xs font-medium">{t("analytics")}</span>
                </CardContent>
              </Card>
            </Link>
          </div>

          <InstallPrompt eventCount={totalEventCount} />
        </>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-lg font-semibold">{t("timelineTitle")}</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {(["all", "feeding", "sleep", "diaper"] as const).map((value) => (
                <button
                  key={value}
                  className={`rounded-full border px-3 py-1 transition ${
                    filter === value ? "bg-accent font-semibold" : "bg-background hover:bg-accent"
                  }`}
                  onClick={() => setFilter(value)}
                  type="button"
                >
                  {value === "all" ? t("filters.all") : t(`filters.${value}`)}
                </button>
              ))}
            </div>
          </div>

          {filteredTimeline.length > 0 ? (
            <ul className="space-y-2">
              {filteredTimeline.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
                >
                  <span>{event.summary}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(event.happenedAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t("timelineEmpty")}</p>
          )}
        </div>
      )}

      {feedInitialData ? (
        <FeedForm
          open={quickFeedOpen}
          onOpenChange={setQuickFeedOpen}
          initialData={feedInitialData}
        />
      ) : null}
      {sleepInitialData ? (
        <SleepForm
          open={quickSleepOpen}
          onOpenChange={setQuickSleepOpen}
          initialData={sleepInitialData}
        />
      ) : null}
      {diaperInitialData ? (
        <DiaperForm
          open={quickDiaperOpen}
          onOpenChange={setQuickDiaperOpen}
          initialData={diaperInitialData}
        />
      ) : null}

      <FabMenu />
    </div>
  );
}
