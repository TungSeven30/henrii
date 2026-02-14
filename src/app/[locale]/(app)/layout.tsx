import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { BabySwitcher } from "@/components/baby-switcher";
import { LocaleNav } from "@/components/layout/locale-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

type AppLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout({ children, params }: AppLayoutProps) {
  const { locale } = await params;
  const nav = await getTranslations({ locale, namespace: "nav" });
  const common = await getTranslations({ locale, namespace: "common" });

  const navItems = [
    { href: "/baby", label: nav("baby") },
    { href: "/settings", label: nav("settings") },
  ];

  return (
    <div className="min-h-dvh pb-20">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/85 backdrop-blur-md">
        <LocaleNav appName={common("appName")} items={navItems} brandHref="/dashboard">
          <BabySwitcher />
        </LocaleNav>
      </header>
      {children}
      <MobileBottomNav
        dashboardLabel={nav("dashboard")}
        timelineLabel={nav("timeline")}
        healthLabel={nav("health")}
        settingsLabel={nav("settings")}
      />
    </div>
  );
}
