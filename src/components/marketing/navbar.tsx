"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { MarketingLogo } from "./henrii-logo";

const NAV_LINKS = [
  { href: "#features", key: "features" },
  { href: "#pricing", key: "pricing" },
  { href: "#faq", key: "faq" },
  { href: "/blog", key: "blog" },
] as const;

export function MarketingNavbar() {
  const locale = useLocale();
  const t = useTranslations("marketing.nav");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/80 shadow-sm"
          : "bg-background/85 backdrop-blur-md border-b border-border/40"
      }`}
    >
      <nav className="container h-16 md:h-18 flex items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          aria-label="henrii home"
          className="inline-flex items-center gap-2"
        >
          <MarketingLogo variant="both" size="md" />
        </Link>

        <div className="hidden md:flex items-center gap-2 xl:gap-4">
          <div className="flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map(({ href, key }) => {
              if (href.startsWith("#")) {
                return (
                  <a
                    key={key}
                    href={href}
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-card"
                  >
                    {t(key)}
                  </a>
                );
              }

              return (
                <Link
                  key={key}
                  href={`/${locale}${href}`}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-card"
                >
                  {t(key)}
                </Link>
              );
            })}
          </div>

          <Button size="sm" asChild className="rounded-full">
            <Link href={`/${locale}/signup`}>{t("signup")}</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container py-4 space-y-2">
            {NAV_LINKS.map(({ href, key }) => {
              if (href.startsWith("#")) {
                return (
                  <a
                    key={key}
                    href={href}
                    className="block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-card"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(key)}
                  </a>
                );
              }

              return (
                <Link
                  key={key}
                  href={`/${locale}${href}`}
                  className="block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-card"
                  onClick={() => setMenuOpen(false)}
                >
                  {t(key)}
                </Link>
              );
            })}

            <Button size="sm" asChild className="w-full mt-1">
              <Link href={`/${locale}/signup`} onClick={() => setMenuOpen(false)}>
                {t("signup")}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
