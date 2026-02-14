import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import { Baby, Sparkles, UserPlus } from "lucide-react";

const STEPS = [
  { key: "signup", icon: UserPlus },
  { key: "profile", icon: Baby },
  { key: "track", icon: Sparkles },
] as const;

export function HowItWorksSection() {
  const t = useTranslations("marketing.howItWorks");

  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-5xl px-4 py-16 md:py-24"
    >
      <AnimateIn className="text-center mb-12">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          {t("title")}
        </h2>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          {t("subtitle")}
        </p>
      </AnimateIn>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-3xl mx-auto">
        <div className="pointer-events-none absolute hidden md:block left-[16.67%] right-[16.67%] top-12 h-px border-t-2 border-dashed border-border" />

        {STEPS.map((step, i) => (
          <AnimateIn key={step.key} delay={i * 100}>
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-card shadow-sm">
                <step.icon size={24} className="text-primary" />
              </div>
              <div className="inline-flex rounded-full border border-border/80 bg-foreground/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                Step {i + 1}
              </div>
              <h3 className="font-medium text-foreground">
                {t(`${step.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`${step.key}.description`)}
              </p>
              <p className="mt-3 text-xs text-foreground/80">
                {t(`${step.key}.benefit`)}
              </p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
