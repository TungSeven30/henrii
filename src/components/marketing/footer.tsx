import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function MarketingFooter() {
  const t = useTranslations("marketing.footer");

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-foreground">
              henrii
            </span>
            <span className="text-xs text-muted-foreground">
              {t("tagline")}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
