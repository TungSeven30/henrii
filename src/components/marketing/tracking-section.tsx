import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import {
  Baby,
  Moon,
  Droplets,
  Syringe,
  TrendingUp,
  Star,
  CalendarHeart,
} from "lucide-react";

const TRACKERS = [
  {
    key: "feeding",
    icon: Baby,
    borderClass: "border-l-henrii-cream",
    bgClass: "bg-henrii-cream/10",
  },
  {
    key: "sleep",
    icon: Moon,
    borderClass: "border-l-henrii-blue",
    bgClass: "bg-henrii-blue/10",
  },
  {
    key: "diaper",
    icon: Droplets,
    borderClass: "border-l-henrii-pink",
    bgClass: "bg-henrii-pink/10",
  },
  {
    key: "vaccination",
    icon: Syringe,
    borderClass: "border-l-henrii-purple",
    bgClass: "bg-henrii-purple/10",
  },
  {
    key: "growth",
    icon: TrendingUp,
    borderClass: "border-l-henrii-green",
    bgClass: "bg-henrii-green/10",
  },
  {
    key: "milestones",
    icon: Star,
    borderClass: "border-l-henrii-cream",
    bgClass: "bg-henrii-cream/10",
  },
  {
    key: "appointments",
    icon: CalendarHeart,
    borderClass: "border-l-henrii-blue",
    bgClass: "bg-henrii-blue/10",
  },
] as const;

export function TrackingSection() {
  const t = useTranslations("marketing.features");

  return (
    <section
      id="features"
      className="py-16 md:py-20 relative overflow-hidden scroll-mt-16"
    >
      <div className="absolute bottom-0 left-0 h-80 w-80 bg-henrii-pink/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      <div className="absolute top-20 right-0 h-48 w-48 bg-henrii-blue/10 rounded-full blur-3xl translate-x-1/2" />

      <div className="container relative">
        <AnimateIn className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-muted-foreground">{t("subtitle")}</p>
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {TRACKERS.map((tracker, i) => {
            const Icon = tracker.icon;

            return (
              <AnimateIn key={tracker.key} delay={i * 60}>
                <article
                  className={`rounded-xl bg-card border border-border ${tracker.borderClass} border-l-4 p-5 shadow-sm transition hover:shadow-md`}
                >
                  <div className={`w-10 h-10 rounded-lg ${tracker.bgClass} flex items-center justify-center mb-3`}>
                    <Icon size={20} className="text-foreground/70" />
                  </div>

                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {t(`${tracker.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {t(`${tracker.key}.description`)}
                  </p>
                </article>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
