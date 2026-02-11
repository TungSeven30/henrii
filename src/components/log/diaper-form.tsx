"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { displayDiaperType, normalizeDiaperType } from "@/lib/events/parse";
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

type DiaperType = "wet" | "dirty" | "both";
type DiaperColor = "yellow" | "green" | "brown" | "black" | "red" | "white";
type DiaperConsistency = "liquid" | "soft" | "formed" | "hard";

export interface DiaperInitialData {
  id?: string;
  changed_at: string;
  type: string;
  color: string | null;
  consistency: string | null;
  notes: string | null;
}

interface DiaperFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DiaperInitialData;
  onUpdated?: () => void;
}

const COLOR_MAP: Record<DiaperColor, string> = {
  yellow: "bg-yellow-400",
  green: "bg-green-500",
  brown: "bg-amber-800",
  black: "bg-gray-900",
  red: "bg-red-500",
  white: "bg-white border border-border",
};

function nowLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function DiaperForm({ open, onOpenChange, initialData, onUpdated }: DiaperFormProps) {
  const t = useTranslations("diaper");
  const tCommon = useTranslations("common");
  const tSync = useTranslations("sync");
  const tTimeline = useTranslations("timeline");
  const router = useRouter();
  const activeBaby = useBabyStore((s) => s.activeBaby);

  const isEditMode = !!initialData?.id;

  const [type, setType] = useState<DiaperType>(() =>
    initialData?.type ? displayDiaperType(initialData.type) : "wet",
  );
  const [color, setColor] = useState<DiaperColor | null>(
    (initialData?.color as DiaperColor | null) ?? null,
  );
  const [consistency, setConsistency] = useState<DiaperConsistency | null>(
    (initialData?.consistency as DiaperConsistency | null) ?? null,
  );
  const [changedAt, setChangedAt] = useState(
    initialData ? toLocalInput(initialData.changed_at) : nowLocal,
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  const showDirtyFields = type === "dirty" || type === "both";

  function resetForm() {
    setType("wet");
    setColor(null);
    setConsistency(null);
    setChangedAt(nowLocal());
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
      const changedAtDate = new Date(changedAt);
      if (Number.isNaN(changedAtDate.getTime())) {
        toast.error(tCommon("saveFailed"));
        return;
      }

      const payload = {
        baby_id: activeBaby.id,
        logged_by: null,
        changed_at: changedAtDate.toISOString(),
        type,
        color: showDirtyFields && color ? color : null,
        consistency: showDirtyFields && consistency ? consistency : null,
        notes: notes || null,
      };

      if (isEditMode && initialData?.id) {
        const mappedType = normalizeDiaperType(type);
        const response = await fetch("/api/events/mutate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            table: "diaper_changes",
            operation: "update",
            id: initialData.id,
            expectedUpdatedAt: null,
            patch: {
              change_type: mappedType,
              changed_at: changedAtDate.toISOString(),
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
          tableName: "diaper_changes",
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

  const diaperTypes: DiaperType[] = ["wet", "dirty", "both"];
  const colors: DiaperColor[] = ["yellow", "green", "brown", "black", "red", "white"];
  const consistencies: DiaperConsistency[] = ["liquid", "soft", "formed", "hard"];

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
          {/* Diaper type toggle */}
          <div className="flex flex-col gap-2">
            <Label>{t("type")}</Label>
            <div className="flex gap-2">
              {diaperTypes.map((dt) => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => {
                    setType(dt);
                    // Clear dirty-specific fields when switching away
                    if (dt !== "dirty" && dt !== "both") {
                      setColor(null);
                      setConsistency(null);
                    }
                  }}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                    type === dt
                      ? "bg-henrii-green/20 text-henrii-green"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {t(dt)}
                </button>
              ))}
            </div>
          </div>

          {/* Color selector (dirty/both only) */}
          {showDirtyFields && (
            <div className="flex flex-col gap-2">
              <Label>
                {t("color")}{" "}
                <span className="text-muted-foreground font-normal">
                  ({tCommon("optional")})
                </span>
              </Label>
              <div className="flex gap-3">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(color === c ? null : c)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={cn(
                        "size-8 rounded-full transition-all",
                        COLOR_MAP[c],
                        color === c
                          ? "ring-2 ring-primary ring-offset-2"
                          : "opacity-60",
                      )}
                    />
                    <span className="text-xs text-muted-foreground">{t(c)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Consistency selector (dirty/both only) */}
          {showDirtyFields && (
            <div className="flex flex-col gap-2">
              <Label>
                {t("consistency")}{" "}
                <span className="text-muted-foreground font-normal">
                  ({tCommon("optional")})
                </span>
              </Label>
              <div className="flex gap-2">
                {consistencies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConsistency(consistency === c ? null : c)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                      consistency === c
                        ? "bg-henrii-green/20 text-henrii-green"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {t(c)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Changed at */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="diaper-time">{t("time")}</Label>
            <Input
              id="diaper-time"
              type="datetime-local"
              value={changedAt}
              onChange={(e) => setChangedAt(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="diaper-notes">
              {t("notes")}{" "}
              <span className="text-muted-foreground font-normal">
                ({tCommon("optional")})
              </span>
            </Label>
            <textarea
              id="diaper-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] w-full rounded-md border px-3 py-2 text-base shadow-xs outline-none md:text-sm"
            />
          </div>

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? tCommon("loading") : tCommon("save")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
