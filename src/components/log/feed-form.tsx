"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logEvent } from "@/lib/log-event";
import { incrementEventCount } from "@/lib/event-counter";
import { useBabyStore } from "@/stores/baby-store";
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

type FeedType = "breast" | "bottle" | "solid";

export interface FeedInitialData {
  id?: string;
  type: FeedType;
  amount_ml: number | null;
  amount_description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
}

interface FeedFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FeedInitialData;
  onUpdated?: () => void;
}

function calculateDuration(start: string, end: string | null): number | null {
  if (!end) return null;
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs <= 0) return null;
  return Math.round(diffMs / 60_000);
}

function nowLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function FeedForm({ open, onOpenChange, initialData, onUpdated }: FeedFormProps) {
  const t = useTranslations("feed");
  const tCommon = useTranslations("common");
  const tSync = useTranslations("sync");
  const tTimeline = useTranslations("timeline");
  const router = useRouter();
  const activeBaby = useBabyStore((s) => s.activeBaby);

  const isEditMode = !!initialData?.id;

  const [type, setType] = useState<FeedType>(initialData?.type ?? "breast");
  const [startTime, setStartTime] = useState(
    initialData ? toLocalInput(initialData.started_at) : nowLocal,
  );
  const [endTime, setEndTime] = useState(
    initialData?.ended_at ? toLocalInput(initialData.ended_at) : "",
  );
  const [amountMl, setAmountMl] = useState(
    initialData?.amount_ml != null ? String(initialData.amount_ml) : "",
  );
  const [amountDescription, setAmountDescription] = useState(
    initialData?.amount_description ?? "",
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setType("breast");
    setStartTime(nowLocal());
    setEndTime("");
    setAmountMl("");
    setAmountDescription("");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBaby) {
      toast.error(tCommon("activeBabyRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const startedAtDate = new Date(startTime);
      if (Number.isNaN(startedAtDate.getTime())) {
        toast.error(tCommon("saveFailed"));
        return;
      }

      const payload = {
        baby_id: activeBaby.id,
        logged_by: null,
        type,
        amount_ml: type === "bottle" && amountMl ? Number(amountMl) : null,
        amount_description:
          type === "solid" && amountDescription ? amountDescription : null,
        started_at: startedAtDate.toISOString(),
        ended_at: endTime || null,
        duration_minutes: calculateDuration(startTime, endTime || null),
        notes: notes || null,
      };

      if (isEditMode && initialData?.id) {
        const response = await fetch("/api/events/mutate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            table: "feedings",
            operation: "update",
            id: initialData.id,
            expectedUpdatedAt: null,
            patch: {
              feeding_type: type,
              amount_ml: type === "bottle" && amountMl ? Number(amountMl) : null,
              started_at: startedAtDate.toISOString(),
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
          tableName: "feedings",
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
    } catch (error) {
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error(tCommon("saveFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const feedTypes: FeedType[] = ["breast", "bottle", "solid"];

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-6">
          {/* Feed type toggle */}
          <div className="flex flex-col gap-2">
            <Label>{t("type")}</Label>
            <div className="flex gap-2">
              {feedTypes.map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setType(ft)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                    type === ft
                      ? "bg-henrii-pink/20 text-henrii-pink"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {t(ft)}
                </button>
              ))}
            </div>
          </div>

          {/* Start time */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="feed-start">{t("startTime")}</Label>
            <Input
              id="feed-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          {/* End time */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="feed-end">
              {t("endTime")}{" "}
              <span className="text-muted-foreground font-normal">
                ({tCommon("optional")})
              </span>
            </Label>
            <Input
              id="feed-end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          {/* Amount (bottle only) */}
          {type === "bottle" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="feed-amount">{t("amount")}</Label>
              <Input
                id="feed-amount"
                type="number"
                inputMode="numeric"
                min={0}
                value={amountMl}
                onChange={(e) => setAmountMl(e.target.value)}
                placeholder={t("amountPlaceholder")}
              />
            </div>
          )}

          {/* Description (solid only) */}
          {type === "solid" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="feed-desc">{t("description")}</Label>
              <Input
                id="feed-desc"
                value={amountDescription}
                onChange={(e) => setAmountDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="feed-notes">
              {t("notes")}{" "}
              <span className="text-muted-foreground font-normal">
                ({tCommon("optional")})
              </span>
            </Label>
            <textarea
              id="feed-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] w-full rounded-md border px-3 py-2 text-base shadow-xs outline-none md:text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2"
            data-testid="feed-save"
          >
            {submitting ? tCommon("loading") : tCommon("save")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
