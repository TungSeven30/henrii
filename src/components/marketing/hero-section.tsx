import { Link } from "@/i18n/navigation";
import { AnimateIn } from "./animate-in";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

const HERO_BG = "/marketing/hero-bg.svg";
const APP_MOCKUP = "/marketing/app-mockup.svg";

function FloatingMockup() {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[360px] md:w-[420px] lg:w-[470px]">
      <div className="pointer-events-none absolute -top-16 -left-12 h-36 w-36 rounded-full bg-henrii-blue/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -right-12 h-40 w-40 rounded-full bg-henrii-pink/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-10 h-36 w-36 rounded-full bg-henrii-cream/28 blur-3xl" />
      <img
        src={APP_MOCKUP}
        alt="henrii app dashboard showing feedings, sleep, and diaper tracking"
        className="relative mx-auto block w-full drop-shadow-2xl"
        loading="eager"
        style={{ animation: "float 6s ease-in-out infinite" }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("marketing.hero");
  const navT = useTranslations("marketing.nav");

  return (
    <section className="relative min-h-[90dvh] flex items-center overflow-hidden pt-16 md:pt-20">
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt="Soft watercolor background wash"
          className="h-full min-h-[90dvh] w-full object-cover opacity-40 dark:opacity-20"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/35 to-background" />
      </div>

      <div className="relative z-10 w-full py-12 md:py-20">
        <div className="container relative">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12">
            <AnimateIn>
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-henrii-pink/35 bg-henrii-pink/15 px-4 py-1.5 text-sm font-medium text-foreground">
                  {t("badge")}
                </span>
                <h1 className="mt-6 font-heading text-5xl md:text-6xl lg:text-7xl font-black leading-[1.03] text-foreground">
                  {t("headline")}
                </h1>
                <p className="mt-7 max-w-md text-lg md:text-xl leading-relaxed text-muted-foreground">
                  {t("subheadline")}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild className="rounded-full shadow-sm hover:shadow-md">
                    <Link href="/signup">{navT("signup")}</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="rounded-full border-2"
                  >
                    <a href="#features" className="inline-flex items-center gap-1.5">
                      {t("secondary_cta")}
                      <ArrowRight size={16} />
                    </a>
                  </Button>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{t("disclaimer")}</p>
              </div>
            </AnimateIn>

            <AnimateIn delay={120}>
              <FloatingMockup />
            </AnimateIn>
          </div>
        </div>
      </div>
    </section>
  );
}
