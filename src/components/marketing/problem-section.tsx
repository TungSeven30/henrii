import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";

export function ProblemSection() {
  const t = useTranslations("marketing.problem");

  return (
    <section id="problem" className="relative overflow-hidden py-16 md:py-20">
      <div className="pointer-events-none absolute -top-10 -right-28 h-48 w-48 rounded-full bg-henrii-cream/25 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4">
        <AnimateIn className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
            {t("title")}
          </h2>
          <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>{t("line1")}</p>
            <p>{t("line2")}</p>
            <p className="text-foreground font-medium">{t("line3")}</p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
