import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import {
  Baby,
  Moon,
  Droplets,
  Shield,
  TrendingUp,
  Star,
  Calendar,
} from "lucide-react";

const FEATURES = [
  { key: "feeding", icon: Baby, borderColor: "#F8E4B4" },
  { key: "sleep", icon: Moon, borderColor: "#B4D8F8" },
  { key: "diaper", icon: Droplets, borderColor: "#F8B4C8" },
  { key: "vaccination", icon: Shield, borderColor: "#C4B5FD" },
  { key: "growth", icon: TrendingUp, borderColor: "#86EFAC" },
  { key: "milestones", icon: Star, borderColor: "#FCD34D" },
  { key: "appointments", icon: Calendar, borderColor: "#93C5FD" },
] as const;

export function FeaturesSection() {
  const t = useTranslations("marketing.features");

  return (
    <section id="features" className="scroll-mt-16 mx-auto max-w-5xl px-4 py-16 md:py-24">
      <AnimateIn className="text-center mb-12">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          {t("title")}
        </h2>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          {t("subtitle")}
        </p>
      </AnimateIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURES.map(({ key, icon: Icon, borderColor }, i) => (
          <AnimateIn key={key} delay={i * 50}>
            <div
              className="rounded-lg bg-card border border-border p-4 shadow-sm border-l-4 h-full"
              style={{ borderLeftColor: borderColor }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Icon size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-foreground">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {t(`${key}.description`)}
                  </p>
                </div>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
