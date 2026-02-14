import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";

export function ProblemSection() {
  const t = useTranslations("marketing.problem");

  return (
    <section id="problem" className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      <AnimateIn className="text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">
          {t("title")}
        </h2>
        <div className="mx-auto max-w-2xl space-y-3 text-muted-foreground text-base leading-relaxed">
          <p>{t("line1")}</p>
          <p>{t("line2")}</p>
          <p className="text-foreground font-medium">{t("line3")}</p>
        </div>
      </AnimateIn>
    </section>
  );
}
