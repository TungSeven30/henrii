import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";

export function NameSection() {
  const t = useTranslations("marketing.name");

  return (
    <section id="name" className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-b from-background via-henrii-blue/5 to-background">
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-32 h-80 w-80 rounded-full bg-henrii-pink/10 blur-3xl" />
      <div className="mx-auto max-w-3xl px-4">
        <AnimateIn className="text-center">
          <p className="inline-flex items-center rounded-full border border-henrii-pink/25 bg-henrii-pink/10 px-3 py-1 text-xs font-medium text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h2 className="mt-5 font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>

          <div className="mx-auto mt-4 max-w-2xl space-y-3 text-muted-foreground text-base leading-relaxed">
            <p>{t("line1")}</p>
            <p>
              {t("line2")}
            </p>
            <p>{t("line3")}</p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
