import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import { Check } from "lucide-react";

const FREE_FEATURES = [
  "tracking",
  "vaccination",
  "growth",
  "milestones",
  "offline",
  "darkMode",
] as const;

const PREMIUM_FEATURES = [
  "charts",
  "analytics",
  "pdf",
  "caregivers",
  "attachments",
] as const;

export function PricingSection() {
  const t = useTranslations("marketing.pricing");

  return (
    <section
      id="pricing"
      className="scroll-mt-16 bg-card border-y border-border"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <AnimateIn className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            {t("subtitle")}
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free tier */}
          <AnimateIn>
            <div className="rounded-lg border border-border bg-background p-6 shadow-sm h-full">
              <h3 className="font-heading text-xl font-bold text-foreground">
                {t("free.title")}
              </h3>
              <p className="text-2xl font-bold text-foreground mt-2">
                {t("free.price")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("free.description")}
              </p>
              <ul className="mt-6 space-y-3">
                {FREE_FEATURES.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className="text-henrii-green shrink-0 mt-0.5"
                    />
                    <span className="text-foreground">{t(`free.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimateIn>

          {/* Premium tier */}
          <AnimateIn delay={100}>
            <div className="rounded-lg border-2 border-primary bg-background p-6 shadow-sm h-full relative">
              <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
                {t("premium.badge")}
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                {t("premium.title")}
              </h3>
              <p className="text-2xl font-bold text-foreground mt-2">
                {t("premium.price")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("premium.description")}
              </p>
              <ul className="mt-6 space-y-3">
                {FREE_FEATURES.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className="text-henrii-green shrink-0 mt-0.5"
                    />
                    <span className="text-muted-foreground">
                      {t(`free.${key}`)}
                    </span>
                  </li>
                ))}
                {PREMIUM_FEATURES.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className="text-henrii-green shrink-0 mt-0.5"
                    />
                    <span className="text-foreground font-medium">
                      {t(`premium.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
