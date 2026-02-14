import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnimateIn } from "./animate-in";

export function CtaSection() {
  const t = useTranslations("marketing.cta");
  const navT = useTranslations("marketing.nav");

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-henrii-pink/15 via-henrii-cream/20 to-henrii-blue/15 px-6 py-14 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_45%)] pointer-events-none" />
          <AnimateIn className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              {t("headline")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("subheadline")}</p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">{navT("signup")}</Link>
              </Button>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
