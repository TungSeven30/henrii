"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Plus,
  UtensilsCrossed,
  Moon,
  Droplets,
  Scale,
  MoreHorizontal,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/haptic";
import { FeedForm } from "@/components/log/feed-form";
import { SleepForm } from "@/components/log/sleep-form";
import { DiaperForm } from "@/components/log/diaper-form";
import { GrowthForm } from "@/components/log/growth-form";

type ActiveForm = "feed" | "sleep" | "diaper" | "growth" | null;

export function FabMenu() {
  const t = useTranslations("fab");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);

  const handleFabTap = useCallback(() => {
    hapticFeedback();
    setMenuOpen(true);
  }, []);

  function openForm(form: ActiveForm) {
    setMenuOpen(false);
    // Small delay so the menu sheet closes before the form sheet opens,
    // preventing both sheets from fighting over the overlay.
    setTimeout(() => {
      setActiveForm(form);
    }, 150);
  }

  function handleOptionTap(option: string) {
    hapticFeedback();
    switch (option) {
      case "feed":
        openForm("feed");
        break;
      case "sleep":
        openForm("sleep");
        break;
      case "diaper":
        openForm("diaper");
        break;
      case "weight":
        openForm("growth");
        break;
      case "more":
        setMenuOpen(false);
        toast("Coming soon");
        break;
    }
  }

  const options = [
    {
      key: "feed",
      icon: UtensilsCrossed,
      color: "bg-henrii-pink/20 text-henrii-pink",
    },
    {
      key: "sleep",
      icon: Moon,
      color: "bg-henrii-blue/20 text-henrii-blue",
    },
    {
      key: "diaper",
      icon: Droplets,
      color: "bg-henrii-green/20 text-henrii-green",
    },
    {
      key: "weight",
      icon: Scale,
      color: "bg-henrii-amber/20 text-henrii-amber",
    },
    {
      key: "more",
      icon: MoreHorizontal,
      color: "bg-muted text-muted-foreground",
    },
  ] as const;

  return (
    <>
      {/* FAB button */}
      <button
        onClick={handleFabTap}
        className={cn(
          "fixed z-50 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95",
          "size-14",
        )}
        style={{ bottom: 88, right: 24 }}
        aria-label="Quick log"
      >
        <Plus className="size-6" />
      </button>

      {/* FAB menu sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[85vh]"
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Quick log</SheetTitle>
            <SheetDescription>Choose what to log</SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-5 gap-2 px-4 pb-6">
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleOptionTap(opt.key)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-14 rounded-full transition-colors",
                    opt.color,
                  )}
                >
                  <opt.icon className="size-6" />
                </div>
                <span className="text-xs font-medium">{t(opt.key)}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Form sheets */}
      <FeedForm
        open={activeForm === "feed"}
        onOpenChange={(open) => {
          if (!open) setActiveForm(null);
        }}
      />

      <SleepForm
        open={activeForm === "sleep"}
        onOpenChange={(open) => {
          if (!open) setActiveForm(null);
        }}
      />

      <DiaperForm
        open={activeForm === "diaper"}
        onOpenChange={(open) => {
          if (!open) setActiveForm(null);
        }}
      />

      <GrowthForm
        open={activeForm === "growth"}
        onOpenChange={(open) => {
          if (!open) setActiveForm(null);
        }}
      />
    </>
  );
}
