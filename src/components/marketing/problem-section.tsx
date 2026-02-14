import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";

export function ProblemSection() {
  const t = useTranslations("marketing.problem");

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      <div className="absolute -top-10 right-0 w-72 h-72 rounded-full bg-henrii-cream/20 blur-3xl translate-x-1/2" />
      <div className="container relative">
        <AnimateIn className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
            {t("title")}
          </h2>
          <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>{t("line1")}</p>
            <p>{t("line2")}</p>
            <p className="text-foreground font-semibold">{t("line3")}</p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
