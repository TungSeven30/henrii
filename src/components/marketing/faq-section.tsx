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
    <section id="faq" className="scroll-mt-16 mx-auto max-w-5xl px-4 py-16 md:py-24">
      <AnimateIn className="text-center mb-12">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          {t("title")}
        </h2>
      </AnimateIn>

      <div className="max-w-2xl mx-auto space-y-3">
        {FAQ_KEYS.map((key, i) => (
          <AnimateIn key={key} delay={i * 40}>
            <details className="group rounded-lg border border-border bg-card shadow-sm">
              <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-2 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {t(`${key}.question`)}
                <span className="text-muted-foreground transition-transform duration-200 group-open:rotate-45 shrink-0 text-lg leading-none">
                  +
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                {t(`${key}.answer`)}
              </div>
            </details>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
