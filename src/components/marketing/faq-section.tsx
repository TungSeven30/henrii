import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";

const FAQ_KEYS = [
  "whatIs",
  "isFree",
  "appStore",
  "offline",
  "sharing",
  "dataSafe",
  "languages",
  "different",
] as const;

export function FaqSection() {
  const t = useTranslations("marketing.faq");

  return (
    <section id="faq" className="scroll-mt-16 py-16 md:py-20">
      <div className="container max-w-4xl">
        <AnimateIn className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
        </AnimateIn>

        <div className="space-y-3">
          {FAQ_KEYS.map((key, i) => (
            <AnimateIn key={key} delay={i * 50}>
              <details className="group rounded-xl border border-border bg-card p-4 md:p-5">
                <summary className="list-none cursor-pointer flex items-center justify-between gap-3 text-left text-sm md:text-base font-semibold text-foreground">
                  <span>{t(`${key}.question`)}</span>
                  <span className="text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">
                  {t(`${key}.answer`)}
                </p>
              </details>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
