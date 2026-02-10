"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { logEvent } from "@/lib/log-event";
import { incrementEventCount } from "@/lib/event-counter";
import { useBabyStore } from "@/stores/baby-store";
import { useUIStore } from "@/stores/ui-store";
import { displayToGrams, displayToCm } from "@/lib/units";
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

interface GrowthFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GrowthForm({ open, onOpenChange }: GrowthFormProps) {
  const t = useTranslations("growth");
  const tCommon = useTranslations("common");
  const tSync = useTranslations("sync");
  const activeBaby = useBabyStore((s) => s.activeBaby);
  const unitSystem = useUIStore((s) => s.unitSystem);

  const isImperial = unitSystem === "imperial";
  const wUnit = isImperial ? "lb" : "g";
  const lUnit = isImperial ? "in" : "cm";
  const wPlaceholder = isImperial ? "7.5" : "3200";
  const lPlaceholder = isImperial ? "19.7" : "50.0";
  const hPlaceholder = isImperial ? "13.8" : "35.0";

  const [measuredAt, setMeasuredAt] = useState(() =>
    format(new Date(), "yyyy-MM-dd"),
  );
  const [weightInput, setWeightInput] = useState("");
  const [lengthInput, setLengthInput] = useState("");
  const [headInput, setHeadInput] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setMeasuredAt(format(new Date(), "yyyy-MM-dd"));
    setWeightInput("");
    setLengthInput("");
    setHeadInput("");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBaby) return;

    const weightRaw = weightInput ? parseFloat(weightInput) : null;
    const lengthRaw = lengthInput ? parseFloat(lengthInput) : null;
    const headRaw = headInput ? parseFloat(headInput) : null;

    if (weightRaw === null && lengthRaw === null && headRaw === null) {
      toast.error(t("atLeastOneMeasurement"));
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Convert display units to metric for DB storage
      const weightGrams =
        weightRaw !== null
          ? Math.round(displayToGrams(weightRaw, isImperial ? "lb" : "g"))
          : null;
      const lengthCm =
        lengthRaw !== null
          ? Math.round(displayToCm(lengthRaw, unitSystem) * 10) / 10
          : null;
      const headCm =
        headRaw !== null
          ? Math.round(displayToCm(headRaw, unitSystem) * 10) / 10
          : null;

      const payload: Record<string, unknown> = {
        baby_id: activeBaby.id,
        logged_by: user?.id ?? null,
        measured_at: measuredAt,
        notes: notes || null,
      };

      if (weightGrams !== null) payload.weight_grams = weightGrams;
      if (lengthCm !== null) payload.length_cm = lengthCm;
      if (headCm !== null) payload.head_circumference_cm = headCm;

      // Compute BMI if both weight and length provided
      if (weightGrams !== null && lengthCm !== null) {
        const weightKg = weightGrams / 1000;
        const lengthM = lengthCm / 100;
        payload.bmi = weightKg / (lengthM * lengthM);
      }

      // Compute percentiles if baby DOB and sex are available
      const dob = activeBaby.date_of_birth;
      const sex = activeBaby.gender === "female" ? "female" : "male";
      const ageDays = Math.floor(
        (new Date(measuredAt).getTime() - new Date(dob).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (ageDays > 0) {
        const fetchPercentile = async (
          metric: string,
          value: number,
        ): Promise<number | null> => {
          try {
            const res = await fetch("/api/growth/percentile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ metric, sex, ageDays, value }),
            });
            if (res.ok) {
              const data = await res.json();
              return data.percentile ?? null;
            }
          } catch {
            // Percentile API might not be ready yet
          }
          return null;
        };

        if (weightGrams !== null) {
          payload.weight_percentile = await fetchPercentile(
            "weight-for-age",
            weightGrams / 1000,
          );
        }
        if (lengthCm !== null) {
          payload.length_percentile = await fetchPercentile(
            "length-for-age",
            lengthCm,
          );
        }
        if (headCm !== null) {
          payload.head_percentile = await fetchPercentile(
            "head-for-age",
            headCm,
          );
        }
      }

      const result = await logEvent({
        tableName: "growth_measurements",
        payload,
      });

      if (result.offline) {
        toast(tSync("pending"));
      } else {
        toast.success(t("logged"));
      }

      incrementEventCount();
      resetForm();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="font-heading">{t("logMeasurement")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("logMeasurement")}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-6">
          {/* Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="growth-date">{t("measuredAt")}</Label>
            <Input
              id="growth-date"
              type="date"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              required
            />
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="growth-weight">
              {t("weightLabel", { unit: wUnit })}
            </Label>
            <Input
              id="growth-weight"
              type="number"
              inputMode="decimal"
              min="0"
              step={isImperial ? "0.1" : "1"}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder={wPlaceholder}
            />
          </div>

          {/* Length */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="growth-length">
              {t("lengthLabel", { unit: lUnit })}
            </Label>
            <Input
              id="growth-length"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={lengthInput}
              onChange={(e) => setLengthInput(e.target.value)}
              placeholder={lPlaceholder}
            />
          </div>

          {/* Head circumference */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="growth-head">
              {t("headLabel", { unit: lUnit })}
            </Label>
            <Input
              id="growth-head"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={headInput}
              onChange={(e) => setHeadInput(e.target.value)}
              placeholder={hPlaceholder}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="growth-notes">
              {t("notes")}{" "}
              <span className="text-muted-foreground font-normal">
                ({tCommon("optional")})
              </span>
            </Label>
            <textarea
              id="growth-notes"
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
