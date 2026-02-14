"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Moon, UtensilsCrossed, Square } from "lucide-react";
import { useTimerStore } from "@/stores/timer-store";
import { useBabyStore } from "@/stores/baby-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SleepForm } from "@/components/log/sleep-form";
import { FeedForm } from "@/components/log/feed-form";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function useElapsed(startedAt: string): string {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

interface TimerChipProps {
  type: "sleep" | "feeding";
  startedAt: string;
  onClick: () => void;
}

function TimerChip({ type, startedAt, onClick }: TimerChipProps) {
  const elapsed = useElapsed(startedAt);
  const Icon = type === "sleep" ? Moon : UtensilsCrossed;

  return (
    <button
      onClick={onClick}
      data-testid={`active-timer-chip-${type}`}
      className="flex items-center gap-1.5 rounded-full bg-henrii-green/15 px-2.5 py-1 transition-colors hover:bg-henrii-green/25"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-henrii-green opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-henrii-green" />
      </span>
      <Icon className="size-3.5 text-foreground/70" />
      <span className="font-mono text-xs tabular-nums text-foreground/90">
        {elapsed}
      </span>
    </button>
  );
}

export function ActiveTimerBadge() {
  const t = useTranslations("activeTimer");
  const activeBaby = useBabyStore((s) => s.activeBaby);
  const activeTimers = useTimerStore((state) => state.activeTimers);
  const stopTimer = useTimerStore((state) => state.stopTimer);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [formToOpen, setFormToOpen] = useState<"sleep" | "feed" | null>(null);

  const timers = activeBaby
    ? activeTimers.filter((timer) => timer.babyId === activeBaby.id)
    : [];

  const handleStop = useCallback(
    (id: string, type: "sleep" | "feeding") => {
      stopTimer(id);
      setSheetOpen(false);
      // Small delay so the detail sheet closes before the form opens
      setTimeout(() => {
        setFormToOpen(type === "sleep" ? "sleep" : "feed");
      }, 150);
    },
    [stopTimer],
  );

  if (timers.length === 0) return null;

  return (
    <>
      {/* Header chip(s): show the first timer in the header pill */}
      <div className="flex items-center gap-1">
        {timers.map((timer) => (
          <TimerChip
            key={timer.id}
            type={timer.type}
            startedAt={timer.startedAt}
            onClick={() => setSheetOpen(true)}
          />
        ))}
      </div>

      {/* Timer detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="font-heading">
              {t("activeTimers")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t("activeTimers")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4 pb-6">
            {timers.map((timer) => (
              <TimerDetailCard
                key={timer.id}
                id={timer.id}
                type={timer.type}
                startedAt={timer.startedAt}
                onStop={handleStop}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Form sheets opened after stopping a timer */}
      <SleepForm
        open={formToOpen === "sleep"}
        onOpenChange={(open) => {
          if (!open) setFormToOpen(null);
        }}
      />
      <FeedForm
        open={formToOpen === "feed"}
        onOpenChange={(open) => {
          if (!open) setFormToOpen(null);
        }}
      />
    </>
  );
}

interface TimerDetailCardProps {
  id: string;
  type: "sleep" | "feeding";
  startedAt: string;
  onStop: (id: string, type: "sleep" | "feeding") => void;
}

function TimerDetailCard({
  id,
  type,
  startedAt,
  onStop,
}: TimerDetailCardProps) {
  const t = useTranslations("activeTimer");
  const elapsed = useElapsed(startedAt);
  const Icon = type === "sleep" ? Moon : UtensilsCrossed;
  const label = type === "sleep" ? t("sleep") : t("feeding");
  const startTime = new Date(startedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-henrii-green/15">
        <Icon className="size-6 text-henrii-green" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-2xl tabular-nums">{elapsed}</span>
        <span className="text-xs text-muted-foreground">
          {t("startedAt")} {startTime}
        </span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        data-testid={`active-timer-stop-${type}`}
        onClick={() => onStop(id, type)}
        className="shrink-0"
      >
        <Square className="size-4" />
        {t("stop")}
      </Button>
    </div>
  );
}
