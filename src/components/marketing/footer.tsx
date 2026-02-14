import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MarketingLogo } from "./henrii-logo";

export function MarketingFooter() {
  const t = useTranslations("marketing.footer");

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container py-10 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <MarketingLogo size="md" variant="both" />
            <p className="text-sm text-muted-foreground mt-1">{t("tagline")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground justify-center">
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              {t("blog")}
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              {t("terms")}
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
