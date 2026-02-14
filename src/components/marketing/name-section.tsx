import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";

export function NameSection() {
  const t = useTranslations("marketing.name");

  return (
    <section id="name" className="bg-card border-y border-border py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <AnimateIn className="text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {t("title")}
          </h2>
          <div className="mt-4 space-y-3 text-muted-foreground text-base leading-relaxed">
            <p>{t("line1")}</p>
            <p>{t("line2")}</p>
            <p>{t("line3")}</p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
