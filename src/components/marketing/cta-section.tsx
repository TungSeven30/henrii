import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AnimateIn } from "./animate-in";

export function CtaSection() {
  const t = useTranslations("marketing.cta");
  const navT = useTranslations("marketing.nav");

  return (
    <section className="bg-gradient-to-b from-primary/5 to-background">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <AnimateIn className="max-w-lg mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {t("headline")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("subheadline")}</p>
          <div className="mt-6 flex justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">{navT("signup")}</Link>
            </Button>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
