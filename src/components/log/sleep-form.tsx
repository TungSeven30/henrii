"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Square, Clock, Timer } from "lucide-react";
import { logEvent } from "@/lib/log-event";
import { incrementEventCount } from "@/lib/event-counter";
import { useBabyStore } from "@/stores/baby-store";
import { useTimerStore } from "@/stores/timer-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SleepQuality = "good" | "restless" | "interrupted";
type Mode = "timer" | "manual";

export interface SleepInitialData {
  id?: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  quality: string | null;
  notes: string | null;
}

interface SleepFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SleepInitialData;
  onUpdated?: () => void;
}

function nowLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ElapsedTime({ startedAt }: { startedAt: string }) {
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

  return (
    <span className="font-mono text-4xl tabular-nums">
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function SleepForm({ open, onOpenChange, initialData, onUpdated }: SleepFormProps) {
  const t = useTranslations("sleep");
  const tCommon = useTranslations("common");
  const tSync = useTranslations("sync");
  const tTimeline = useTranslations("timeline");
  const router = useRouter();
  const activeBaby = useBabyStore((s) => s.activeBaby);
  const activeTimers = useTimerStore((state) => state.activeTimers);
  const startTimer = useTimerStore((state) => state.startTimer);
  const stopTimer = useTimerStore((state) => state.stopTimer);

  const isEditMode = !!initialData?.id;

  const activeSleepTimer = activeBaby
    ? activeTimers.find((timer) => timer.babyId === activeBaby.id && timer.type === "sleep")
    : undefined;

  const [mode, setMode] = useState<Mode>(initialData ? "manual" : "timer");
  const [quality, setQuality] = useState<SleepQuality | null>(
    (initialData?.quality as SleepQuality | null) ?? null,
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  // Manual entry state
  const [startTime, setStartTime] = useState(
    initialData ? toLocalInput(initialData.started_at) : nowLocal,
  );
  const [endTime, setEndTime] = useState(
    initialData?.ended_at ? toLocalInput(initialData.ended_at) : "",
  );

  const [submitting, setSubmitting] = useState(false);

  // When the sheet opens, sync the mode to reflect whether there's an active timer
  useEffect(() => {
    if (open) {
      if (activeSleepTimer) {
        setMode("timer");
      }
    }
  }, [open, activeSleepTimer]);

  const resetForm = useCallback(() => {
    setQuality(null);
    setNotes("");
    setStartTime(nowLocal());
    setEndTime("");
  }, []);

  function handleStartTimer() {
    if (!activeBaby) {
      toast.error(tCommon("activeBabyRequired"));
      return;
    }
    startTimer({
      type: "sleep",
      startedAt: new Date().toISOString(),
      babyId: activeBaby.id,
    });
    toast(t("timerRunning"));
    onOpenChange(false);
  }

  async function handleStopTimer() {
    if (!activeBaby || !activeSleepTimer) return;

    setSubmitting(true);
    try {
      const stoppedTimer = stopTimer(activeSleepTimer.id);
      if (!stoppedTimer) return;

      const startedAtMs = new Date(stoppedTimer.startedAt).getTime();
      const endedAtMs = Date.now();
      const durationMinutes = Math.round((endedAtMs - startedAtMs) / 60_000);

      const result = await logEvent({
        tableName: "sleep_sessions",
        payload: {
          baby_id: activeBaby.id,
          logged_by: null,
          started_at: stoppedTimer.startedAt,
          ended_at: new Date(endedAtMs).toISOString(),
          duration_minutes: durationMinutes,
          quality: quality ?? null,
          notes: notes || null,
        },
      });

      if (!result.success) {
        toast.error(result.error ?? tCommon("saveFailed"));
        return;
      }

      if (result.offline) {
        toast(tSync("pending"));
      } else {
        toast.success(t("logged"));
      }

      incrementEventCount();
      resetForm();
      onOpenChange(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBaby || !endTime) return;

    setSubmitting(true);
    try {
      const startMs = new Date(startTime).getTime();
      const endMs = new Date(endTime).getTime();
      const durationMinutes = Math.round((endMs - startMs) / 60_000);

      if (durationMinutes <= 0) return;

      const payload = {
        baby_id: activeBaby.id,
        logged_by: null,
        started_at: new Date(startTime).toISOString(),
        ended_at: new Date(endTime).toISOString(),
        duration_minutes: durationMinutes,
        quality: quality ?? null,
        notes: notes || null,
      };

      if (isEditMode && initialData?.id) {
        const response = await fetch("/api/events/mutate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            table: "sleep_sessions",
            operation: "update",
            id: initialData.id,
            expectedUpdatedAt: null,
            patch: {
              started_at: new Date(startTime).toISOString(),
              ended_at: new Date(endTime).toISOString(),
              duration_minutes: durationMinutes,
              notes: notes || null,
            },
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { error?: unknown }
            | null;
          toast.error(
            data && typeof data.error === "string" ? data.error : tTimeline("updateError"),
          );
          return;
        }

        toast.success(tTimeline("updated"));
        onUpdated?.();
        router.refresh();
      } else {
        const result = await logEvent({
          tableName: "sleep_sessions",
          payload,
        });

        if (!result.success) {
          toast.error(result.error ?? tCommon("saveFailed"));
          return;
        }

        if (result.offline) {
          toast(tSync("pending"));
        } else {
          toast.success(t("logged"));
        }
        incrementEventCount();
        router.refresh();
      }

      if (!isEditMode) resetForm();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const qualityOptions: SleepQuality[] = ["good", "restless", "interrupted"];

  function QualitySelector() {
    return (
      <div className="flex flex-col gap-2">
        <Label>{t("quality")}</Label>
        <div className="flex gap-2">
          {qualityOptions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuality(quality === q ? null : q)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                quality === q
                  ? "bg-henrii-blue/20 text-henrii-blue"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {t(q)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function NotesField() {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor="sleep-notes">
          {t("notes")}{" "}
          <span className="text-muted-foreground font-normal">
            ({tCommon("optional")})
          </span>
        </Label>
        <textarea
          id="sleep-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] w-full rounded-md border px-3 py-2 text-base shadow-xs outline-none md:text-sm"
        />
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="font-heading">{isEditMode ? t("editTitle") : t("title")}</SheetTitle>
          <SheetDescription className="sr-only">{t("title")}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          {/* Mode toggle (hidden in edit mode, always manual) */}
          {!isEditMode && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("timer")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                  mode === "timer"
                    ? "border-henrii-blue/40 bg-henrii-blue/20 text-henrii-blue"
                    : "border-border/70 bg-background text-foreground hover:bg-accent",
                )}
              >
                <Timer className="size-4" />
                {t("timer")}
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                  mode === "manual"
                    ? "border-henrii-blue/40 bg-henrii-blue/20 text-henrii-blue"
                    : "border-border/70 bg-background text-foreground hover:bg-accent",
                )}
              >
                <Clock className="size-4" />
                {t("manualEntry")}
              </button>
            </div>
          )}

          {/* Timer mode */}
          {mode === "timer" && (
            <>
              {activeSleepTimer ? (
                <div className="flex flex-col items-center gap-6">
                  {/* Running clock display */}
                  <div className="flex flex-col items-center gap-2 py-4">
                    <ElapsedTime startedAt={activeSleepTimer.startedAt} />
                    <p className="text-sm text-muted-foreground">
                      {t("startedAt")} {formatTime(activeSleepTimer.startedAt)}
                    </p>
                  </div>

                  <QualitySelector />
                  <NotesField />

                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full mt-2"
                    disabled={submitting}
                    onClick={handleStopTimer}
                  >
                    <Square className="size-4" />
                    {submitting ? tCommon("loading") : t("stopTimer")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Button
                    type="button"
                    size="lg"
                    disabled={submitting || !activeBaby}
                    className="h-14 w-full text-base"
                    onClick={handleStartTimer}
                  >
                    <Play className="size-5" />
                    {t("startTimer")}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Manual entry mode */}
          {mode === "manual" && (
            <form
              onSubmit={handleManualSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="sleep-start">{t("startTime")}</Label>
                <Input
                  id="sleep-start"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sleep-end">{t("endTime")}</Label>
                <Input
                  id="sleep-end"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>

              <QualitySelector />
              <NotesField />

              <Button type="submit" disabled={submitting} className="mt-2">
                {submitting ? tCommon("loading") : tCommon("save")}
              </Button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
