import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import {
  Baby,
  CalendarHeart,
  Droplets,
  Moon,
  Syringe,
  TrendingUp,
  Star,
} from "lucide-react";

const TRACKERS = [
  {
    icon: Baby,
    key: "feeding",
    border: "border-l-henrii-cream",
    bg: "bg-henrii-cream/10",
  },
  {
    icon: Moon,
    key: "sleep",
    border: "border-l-henrii-blue",
    bg: "bg-henrii-blue/10",
  },
  {
    icon: Droplets,
    key: "diaper",
    border: "border-l-henrii-pink",
    bg: "bg-henrii-pink/10",
  },
  {
    icon: Syringe,
    key: "vaccination",
    border: "border-l-henrii-purple",
    bg: "bg-henrii-purple/10",
  },
  {
    icon: TrendingUp,
    key: "growth",
    border: "border-l-henrii-green",
    bg: "bg-henrii-green/10",
  },
  {
    icon: Star,
    key: "milestones",
    border: "border-l-henrii-cream",
    bg: "bg-henrii-cream/10",
  },
  {
    icon: CalendarHeart,
    key: "appointments",
    border: "border-l-henrii-blue",
    bg: "bg-henrii-blue/10",
  },
];

export function TrackingSection() {
  const t = useTranslations("marketing.features");

  return (
    <section
      id="tracking"
      className="relative overflow-hidden py-16 md:py-20"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 bg-henrii-pink/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      <div className="pointer-events-none absolute top-20 right-0 h-48 w-48 bg-henrii-blue/10 rounded-full blur-3xl translate-x-1/2" />

      <div className="container relative">
        <AnimateIn className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            {t("subtitle")}
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {TRACKERS.map((item, index) => (
            <AnimateIn key={item.key} delay={index * 60}>
              <article
                className={`h-full rounded-xl border border-border ${item.border} border-l-4 bg-card p-5 shadow-sm`}
              >
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${item.bg} mb-3`}
                >
                  <item.icon size={20} className="text-foreground/75" />
                </div>
                <h3 className="font-heading text-base md:text-lg font-semibold text-foreground">
                  {t(`${item.key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t(`${item.key}.description`)}
                </p>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
