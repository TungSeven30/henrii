import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimateIn } from "./animate-in";

export function CtaSection() {
  const t = useTranslations("marketing.cta");
  const heroT = useTranslations("marketing.hero");
  const navT = useTranslations("marketing.nav");
  const featuresHref = "/#features";
  const locale = useLocale();
  const signupHref = `/${locale}/signup`;

  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-henrii-pink/10 via-henrii-cream/10 to-henrii-blue/10" />
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-henrii-pink/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-henrii-blue/20 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 relative">
        <AnimateIn className="mx-auto max-w-lg text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {t("headline")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("subheadline")}</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href={signupHref}>{navT("signup")}</Link>
            </Button>
            <Link
              href={featuresHref}
              className="inline-flex h-11 items-center rounded-full border border-border bg-background/75 px-5 text-sm font-medium text-foreground"
            >
              {heroT("secondary_cta")}
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
