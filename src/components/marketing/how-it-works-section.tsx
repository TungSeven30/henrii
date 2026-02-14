import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";

const STEPS = ["signup", "profile", "track"] as const;

export function HowItWorksSection() {
  const t = useTranslations("marketing.howItWorks");

  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-5xl px-4 py-16 md:py-24"
    >
      <AnimateIn className="text-center mb-12">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          {t("title")}
        </h2>
      </AnimateIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {STEPS.map((step, i) => (
          <AnimateIn key={step} delay={i * 100}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-heading font-bold text-lg mb-3">
                {i + 1}
              </div>
              <h3 className="font-medium text-foreground">
                {t(`${step}.title`)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`${step}.description`)}
              </p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
