import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import { MarketingLogo } from "./henrii-logo";

export function NameSection() {
  const t = useTranslations("marketing.name");

  return (
    <section id="name" className="py-16 md:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 md:p-12">
          <div className="pointer-events-none absolute -top-20 -left-12 h-48 w-48 rounded-full bg-henrii-pink/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-12 h-48 w-48 rounded-full bg-henrii-blue/20 blur-3xl" />

          <AnimateIn className="relative mx-auto max-w-2xl text-center">
            <p className="font-medium uppercase tracking-[0.18em] text-xs text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h2 className="mt-2 font-heading text-3xl md:text-4xl font-bold text-foreground">
              {t("title")}
            </h2>
            <div className="mt-6 flex justify-center">
              <MarketingLogo size="xl" variant="both" />
            </div>

            <div className="mt-5 space-y-3 text-muted-foreground text-lg leading-relaxed">
              <p>{t("line1")}</p>
              <p>{t("line2")}</p>
              <p>{t("line3")}</p>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
