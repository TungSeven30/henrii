import { Link } from "@/i18n/navigation";
import { AnimateIn } from "./animate-in";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "./safe-image";

const HERO_BG = "/marketing/hero-bg.svg";
const APP_MOCKUP = "/marketing/app-mockup.svg";
const HERO_BG_FALLBACK =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/75QFX0jm1OtJUTcpssxoq-img-1_1770630639000_na1fn_aGVucmlpLWhlcm8tYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94Lzc1UUZYMGptMU90SlVUY0twc3N4b3EtaW1nLTFfMTc3MDYzMDYzOTAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTEzYUhrdGQyVXRZblZwYkhRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=T9GAftjVpPt-UzoXS3DVFLaNsx9mAG-slxpwdIQkY7R5-gjXNANdsx7zPfmswLfW4zJVgLmWKnp8~3~9QLY7RCxPOw3KSvk1pvatSWJaY5KrZbZDHeJopei9RpmnGk1iro7I6J-1YbRK1oioZ5c11ol7VTKd6QuHQfwPTsPEYhN2PzESrR3pCDQhENT~iiqIUfCVZAJcEqLwYrItNxinn0vZJmSvQ50YWG6P58LgbcXjYfgYnref5nzbxkiPWuA7hLmLRbbOdqcj5G4z71YRRGi8ZYV9brxn9oBllw3T5LqdLaXXGKDthpkNQZU6~skB6bU6stSxX7tvRC7pqZV51Q__";
const APP_MOCKUP_FALLBACK =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/75QFX0jm1OtJUTcKpssxoq_1770630653093_na1fn_aGVucmlpLWFwcC1tb2NrdXA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94Lzc1UUZYMGptMU90SlVUY0twc3N4b3FfMTc3MDYzMDY1MzA5M19uYTFmbl9hR1Z1Y21scExXRndjQzF0YjJOcmRYQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=BJF9q5wzF0SHV6kyfw5E3LLVwJwfSCztd0ubkvI9YBEWgP38yf9d888zqNUHEo-M3osPsKqda5DRF37XgYNAUQ9N44az5yH8dPVNVP0BEE7xRO7fuq0ALEd69joXmp1sa00j5ysGDo6rJKWfaqn9Fe~-ZEYP2~oy4nPx~hrujgCJITKeDpGdhCWR022jOLlYlFNBf-iTqFbS~8GDWpvHkPNficnvV5CBDECQacM-lRED0bO0wMYQrLkibDRoTQAOv1gxFv78MXGzzD2LkDgBCPPVxOU0DgSlktefcXBrTevGeXuIPO6eJ9h-Zvb-uOJbTR9IYz27J5v4-O~1uNNOIg__";

function FloatingMockup() {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[360px] md:w-[420px] lg:w-[470px]">
      <div className="pointer-events-none absolute -top-16 -left-12 h-36 w-36 rounded-full bg-henrii-blue/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -right-12 h-40 w-40 rounded-full bg-henrii-pink/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-10 h-36 w-36 rounded-full bg-henrii-cream/28 blur-3xl" />
      <SafeImage
        src={APP_MOCKUP}
        fallbackSrc={APP_MOCKUP_FALLBACK}
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
        <SafeImage
          src={HERO_BG}
          fallbackSrc={HERO_BG_FALLBACK}
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
