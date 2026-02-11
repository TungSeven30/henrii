import { useTranslations } from "next-intl";
import { AnimateIn } from "./animate-in";
import { WifiOff, Moon, Users, FileText, BarChart3, Globe } from "lucide-react";

const DIFFERENTIATORS = [
  { key: "offline", icon: WifiOff },
  { key: "darkMode", icon: Moon },
  { key: "caregivers", icon: Users },
  { key: "pdf", icon: FileText },
  { key: "analytics", icon: BarChart3 },
  { key: "bilingual", icon: Globe },
] as const;

export function DifferentiatorsSection() {
  const t = useTranslations("marketing.differentiators");

  return (
    <section className="bg-card border-y border-border">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <AnimateIn className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {t("title")}
          </h2>
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {DIFFERENTIATORS.map(({ key, icon: Icon }, i) => (
            <AnimateIn key={key} delay={i * 60}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-medium text-foreground">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {t(`${key}.description`)}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
