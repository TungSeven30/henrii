import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import { UserPlus, Baby, Sparkles } from "lucide-react";

const STEPS = [
  {
    key: "signup",
    icon: UserPlus,
    number: "01",
    benefit: "benefit",
  },
  {
    key: "profile",
    icon: Baby,
    number: "02",
    benefit: "benefit",
  },
  {
    key: "track",
    icon: Sparkles,
    number: "03",
    benefit: "benefit",
  },
] as const;

export function HowItWorksSection() {
  const t = useTranslations("marketing.howItWorks");

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-henrii-blue/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3" />

      <div className="container relative">
        <AnimateIn className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">{t("title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </AnimateIn>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px border-t-2 border-dashed border-border" />

          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <AnimateIn key={step.key} delay={index * 90}>
                <article className="relative text-center rounded-xl bg-card border border-border p-6">
                  <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-henrii-cream/30 text-foreground mb-5">
                    <span className="absolute -top-2 -left-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {step.number}
                    </span>
                    <Icon size={24} aria-hidden="true" />
                  </div>

                  <h3 className="font-heading text-xl font-semibold text-foreground">{t(`${step.key}.title`)}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t(`${step.key}.description`)}</p>
                  <p className="mt-4 text-sm text-foreground/90">{t(`${step.key}.benefit`)}</p>
                </article>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
