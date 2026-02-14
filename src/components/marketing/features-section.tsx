import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import { FileText, Moon, Shield, Users, Wifi, Zap } from "lucide-react";

const FEATURE_KEYS = [
  "offline",
  "darkMode",
  "caregivers",
  "pdf",
  "analytics",
  "bilingual",
] as const;

const FEATURE_IMAGES: Record<(typeof FEATURE_KEYS)[number], string | null> = {
  offline: "/marketing/feature-offline.svg",
  darkMode: "/marketing/feature-darkmode.svg",
  caregivers: "/marketing/feature-sharing.svg",
  pdf: null,
  analytics: null,
  bilingual: null,
};

const FEATURE_ICONS = {
  offline: Wifi,
  darkMode: Moon,
  caregivers: Users,
  pdf: FileText,
  analytics: Zap,
  bilingual: Shield,
};

const FEATURE_IMAGES_GLOW: Record<(typeof FEATURE_KEYS)[number], string> = {
  offline: "from-henrii-blue/12 via-background",
  darkMode: "from-henrii-pink/18 via-background",
  caregivers: "from-henrii-green/10 via-background",
  pdf: "from-henrii-purple/15 via-background",
  analytics: "from-henrii-cream/18 via-background",
  bilingual: "from-henrii-blue/10 via-background",
};

type FeatureKey = (typeof FEATURE_KEYS)[number];

function FeaturePanel({
  index,
  featureKey,
  imageSrc,
}: {
  index: number;
  featureKey: FeatureKey;
  imageSrc: string | null;
}) {
  const t = useTranslations("marketing.differentiators");
  const Icon = FEATURE_ICONS[featureKey];
  const hasImage = imageSrc !== null;
  const isReversed = index % 2 === 1;

  if (!hasImage) {
    return (
      <AnimateIn delay={index * 80}>
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5">
              <Icon size={18} className="text-foreground/75" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {t(`${featureKey}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {t(`${featureKey}.description`)}
              </p>
            </div>
          </div>
        </article>
      </AnimateIn>
    );
  }

  return (
    <AnimateIn delay={index * 80}>
      <article className="relative grid gap-6 md:grid-cols-2 md:items-center">
        <div className={isReversed ? "md:order-2" : ""}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
            <Icon size={20} className="text-foreground/75" />
          </span>
          <h3 className="mt-4 md:mt-5 text-2xl font-heading font-bold text-foreground">
            {t(`${featureKey}.title`)}
          </h3>
          <p className="mt-3 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
            {t(`${featureKey}.description`)}
          </p>
        </div>

        <div className={isReversed ? "md:order-1" : ""}>
          <div
            className={`rounded-3xl bg-gradient-to-br ${FEATURE_IMAGES_GLOW[featureKey]} border border-border p-5`}
          >
            <img
              src={imageSrc}
              alt={t(`${featureKey}.title`)}
              className="h-56 w-full rounded-2xl border border-border/80 object-cover md:h-64"
              loading="lazy"
            />
          </div>
        </div>
      </article>
    </AnimateIn>
  );
}

export function FeaturesSection() {
  const t = useTranslations("marketing.differentiators");
  const topFeatures = FEATURE_KEYS.slice(0, 3);
  const bottomFeatures = FEATURE_KEYS.slice(3);

  return (
    <section
      id="features"
      className="scroll-mt-16 relative overflow-hidden py-16 md:py-20"
    >
      <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 rounded-full bg-henrii-cream/20 blur-3xl -translate-x-1/2" />
      <div className="container relative">
        <AnimateIn className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("bilingual.description")}
          </p>
        </AnimateIn>

        <div className="mx-auto max-w-4xl space-y-12 md:space-y-16">
          {topFeatures.map((key, index) => (
            <FeaturePanel
              key={key}
              index={index}
              featureKey={key}
              imageSrc={FEATURE_IMAGES[key]}
            />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {bottomFeatures.map((key, index) => (
            <FeaturePanel
              key={key}
              index={topFeatures.length + index}
              featureKey={key}
              imageSrc={FEATURE_IMAGES[key]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
