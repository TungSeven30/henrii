"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", key: "features" },
  { href: "#pricing", key: "pricing" },
  { href: "#faq", key: "faq" },
] as const;

export function MarketingNavbar() {
  const t = useTranslations("marketing.nav");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <a
          href="#"
          className="font-heading text-xl font-bold text-foreground"
        >
          henrii
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, key }) => (
            <a
              key={key}
              href={href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t(key)}
            </a>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">{t("signup")}</Link>
            </Button>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          {NAV_LINKS.map(({ href, key }) => (
            <a
              key={key}
              href={href}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              {t(key)}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">{t("signup")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
