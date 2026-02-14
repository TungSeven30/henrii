import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import { Check, Heart, Zap } from "lucide-react";

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

const LIFETIME_FEATURES = [
  "supportForTeam",
  "futureFeatures",
  "prioritySupport",
  "longTermSupport",
] as const;

export function PricingSection() {
  const t = useTranslations("marketing.pricing");

  return (
    <section
      id="pricing"
      className="scroll-mt-16 relative overflow-hidden py-16 md:py-20 bg-card/40 border-y border-border/70"
    >
      <div className="pointer-events-none absolute -top-16 right-0 h-52 w-52 rounded-full bg-henrii-pink/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-henrii-blue/16 blur-3xl" />
      <div className="container">
        <AnimateIn className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{t("subtitle")}</p>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          <AnimateIn delay={80}>
            <article className="relative h-full rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col">
              <div className="absolute -top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-henrii-cream/50">
                <Heart size={16} className="text-henrii-pink" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground">{t("free.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("free.description")}</p>
              <p className="mt-5 text-4xl font-bold text-foreground">{t("free.price")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("free.forever")}</p>

              <ul className="mt-6 space-y-3">
                {FREE_FEATURES.map((key) => (
                  <li key={key} className="flex items-start gap-3 text-sm text-foreground">
                    <Check
                      size={18}
                      className="text-henrii-green shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{t(`free.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </article>
          </AnimateIn>

          <AnimateIn delay={140}>
            <article className="relative h-full rounded-3xl bg-card border-2 border-primary/40 p-6 shadow-md overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-henrii-pink/15 blur-2xl" />
              <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-henrii-pink/5 via-background/0 to-background/0" />

              <div className="relative">
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                  {t("premium.badge")}
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground">{t("premium.title")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("premium.description")}</p>
                <p className="mt-4 text-4xl font-bold text-foreground">{t("premium.price")}</p>
              </div>

              <ul className="relative mt-6 space-y-3">
                {FREE_FEATURES.map((key) => (
                  <li key={key} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check
                      size={18}
                      className="text-henrii-green shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{t(`free.${key}`)}</span>
                  </li>
                ))}
                {PREMIUM_FEATURES.map((key) => (
                  <li key={key} className="flex items-start gap-3 text-sm text-foreground">
                    <Check
                      size={18}
                      className="text-primary shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{t(`premium.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </article>
          </AnimateIn>

          <AnimateIn delay={200}>
            <article className="relative h-full rounded-3xl bg-gradient-to-br from-henrii-cream/25 via-card to-henrii-pink/10 border border-henrii-pink/30 p-6 shadow-sm flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.3),transparent_60%)] pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-henrii-pink/15 px-3 py-1 text-xs font-semibold text-henrii-pink">
                  <Heart size={12} className="fill-current" aria-hidden="true" />
                  <span>{t("lifetime.badge")}</span>
                </div>
                <h3 className="mt-3 font-heading text-2xl font-bold text-foreground">{t("lifetime.title")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("lifetime.description")}</p>
                <p className="mt-4 text-4xl font-bold text-foreground">{t("lifetime.price")}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-henrii-pink/25 bg-background/70 px-3 py-2 text-xs text-foreground/90">
                  <Zap size={13} className="text-henrii-pink" />
                  {t("lifetime.tagline")}
                </div>
              </div>

              <ul className="relative mt-6 space-y-3 text-sm text-foreground">
                {LIFETIME_FEATURES.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <Heart size={15} className="shrink-0 mt-0.5 text-henrii-pink" aria-hidden="true" />
                    <span>{t(`lifetime.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </article>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
