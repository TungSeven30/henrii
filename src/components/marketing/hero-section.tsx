import { useTranslations } from "next-intl";
import { WaitlistForm } from "./waitlist-form";
import { AnimateIn } from "./animate-in";

export function HeroSection() {
  const t = useTranslations("marketing.hero");

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-16 md:pt-28 md:pb-24">
        <AnimateIn className="max-w-2xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
            {t("headline")}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("subheadline")}
          </p>
          <div className="mt-8 flex justify-center">
            <WaitlistForm />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("disclaimer")}
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
