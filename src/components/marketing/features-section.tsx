import { AnimateIn } from "./animate-in";
import { type LucideIcon, FileText, Languages, MoonStar, Wifi, Users, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";

const OFFLINE_IMG =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/75QFX0jm1OtJUTcKpssxoq-img-3_1770630637000_na1fn_aGVucmlpLWZlYXR1cmVzLW9mZmxpbmU.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Njbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94Lzc1UUZYMGptMU90SlVUY0twc3N4b3EtaW1nLTNfMTc3MDYzMDYzNzAwMF9uYTFmbl9hR1Z1Y21scExXWmxZWFIxY21WekxXOW1abXhwYm1VLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=SWgbZZTJZD4JOWTXbPRusBhGw7rKIAje8aQqIWXln4ETxfzk-mXrNxhWpQ2pBGxsjYJS7dLnyUTg8IeCLtxn6gee3wpCuIRMM9WJxpBFBycOIPsSmAI2wFqiAZdw9Rl4Oy1Yv6nmRbGgJYHiOJ2ZiWThpbpZppU9uNOXIgkzIMhb72Xk7v80-XyqIsBUAm-0eMsVEBZfWIe2bfZZbCguGNQggkVzR7wxy18DobuMSINI45yPaMowBfKKQ0-GLoE0JKtSPIjdO1EHNZ5igZeM7ilUQckzYzge3nzc359R9pnvbhx58N2tVHhAFjCtHc09cEnEy6SIs0ao-RiCFYA__";

const DARKMODE_IMG =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/75QFX0jm1OtJUTcKpssxoq-img-4_1770630643000_na1fn_aGVucmlpLWZlYXR1cmVzLWRhcmttb2Rl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Njbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94Lzc1UUZYMGptMU90SlVUY0twc3N4b3EtaW1nLTRfMTc3MDYzMDY0MzAwMF9uYTFmbl9hR1Z1Y21scExXWmxZWFIxY21WekxXUmhjbXR0YjJSbC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=KbqISta51sNygLNbUrJG1LhyoiGV3s5Ud03AOH4XDmtSM6pSvPChNh7hPI0PQNMG-44cCX3AJkoTwc21ZYKP~VD-jkJLLs2IrM-fFqtRaRWL0HwnCIaRtGj~mhopUA3JN-sq6akW61QMPpWyhzNlnIGD3s-OCI1Fr7uZ0WdBGb8g0MprBNvtzi0bQqz~b8Yu1MZ1XEbBPzGv1GiKSZ5hHsiKNFlZlc15UX8Db5x075wSzAsRHDloOkyH-j9p19mciD11iExwAAIkIKTueCxy5FOtQU0wyGg2Wqu1xO9stwb93mjPMJ5Cp-3R6rInR9xQBdtlUP0ebQK~fA92eQx1tw__";

const SHARING_IMG =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/75QFX0jm1OtJUTcKpssxoq-img-5_1770630631000_na1fn_aGVucmlpLWZlYXR1cmVzLXNoYXJpbmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Njbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94Lzc1UUZYMGptMU90SlVUY0twc3N4b3EtaW1nLTVfMTc3MDYzMDYzMTAwMF9uYTFmbl9hR1Z1Y21scExXWmxZWFIxY21WekxYTm9ZWEpwYm1jLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=AY-A7U~5D3-5zP~C0RRH68l5HLPbsNLeNwlYMNQIJhimzPdAAgZZSCr9ZFoF-8DrgVrl2NO7jlbveD4Uts~rd9ksM2G6xhzJhqgINLWSWqmpd~LORGyrD29M8L2OlK2uvIy9liNohkbGu3zvkmEBJWJS9Fp7HJY8kk7vQEexQskkW9qOpXSLwwNdDCvbkXRxj631PAg6JXMYQ2Psl~zEt4TwA8IGN4iy2BPMJ3RUfLupXoCy4KpusqjGL5ZEpuulH3IcP5JsNqfnk7uIULsbGowke93SroxrVz8FtyNxEumo00DHABV2Ve7ROatdyVPgQfz6Zzecoz1HrF-cHFafCQ__";

type FeatureItem = {
  icon: LucideIcon;
  key: "offline" | "darkMode" | "caregivers" | "pdf" | "analytics" | "bilingual";
  image?: string;
  imageAlt?: string;
};

const FEATURES: FeatureItem[] = [
  {
    icon: Wifi,
    key: "offline",
    image: OFFLINE_IMG,
    imageAlt: "Watercolor illustration for offline mode",
  },
  {
    icon: MoonStar,
    key: "darkMode",
    image: DARKMODE_IMG,
    imageAlt: "Watercolor moon and sunrise illustration",
  },
  {
    icon: Users,
    key: "caregivers",
    image: SHARING_IMG,
    imageAlt: "Watercolor caregiver sharing illustration",
  },
  { icon: FileText, key: "pdf" },
  { icon: BarChart3, key: "analytics" },
  { icon: Languages, key: "bilingual" },
] as const;

export function FeaturesSection() {
  const t = useTranslations("marketing.differentiators");

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-background via-henrii-cream/6 to-background">
      <div className="container">
        <AnimateIn className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
        </AnimateIn>

        <div className="space-y-14 md:space-y-16">
          {FEATURES.map((feature, index) => {
            const title = t(`${feature.key}.title`);
            const description = t(`${feature.key}.description`);
            const Icon = feature.icon;
            const isImageCard = Boolean(feature.image);

            if (!isImageCard) {
              return (
                <AnimateIn key={feature.key} delay={index * 80}>
                  <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70">
                      <Icon size={20} className="text-foreground/70" />
                    </div>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-3 text-muted-foreground text-lg leading-relaxed">
                      {description}
                    </p>
                  </div>
                </AnimateIn>
              );
            }

            return (
              <AnimateIn key={feature.key} delay={index * 80}>
                <div
                  className={`grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center ${
                    index % 2 === 1 ? "md:[&>*:first-child]:md:order-2" : ""
                  }`}
                >
                  <div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 mb-4">
                      <Icon size={20} className="text-foreground/70" />
                    </div>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-3 text-muted-foreground text-lg leading-relaxed">
                      {description}
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 -z-10 rounded-3xl bg-henrii-cream/25 blur-2xl" />
                    <img
                      src={feature.image}
                      alt={feature.imageAlt}
                      className="relative w-full max-w-sm mx-auto rounded-2xl"
                      loading="lazy"
                    />
                  </div>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
