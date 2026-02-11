import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { LocaleNav } from "@/components/layout/locale-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

type AppLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout({ children, params }: AppLayoutProps) {
  const { locale } = await params;
  const nav = await getTranslations({ locale, namespace: "nav" });
  const dashboard = await getTranslations({ locale, namespace: "dashboard" });
  const common = await getTranslations({ locale, namespace: "common" });

  const navItems = [
    { href: "/dashboard", label: nav("dashboard") },
    { href: "/settings", label: nav("settings") },
  ];

  return (
    <div className="min-h-dvh pb-20">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/85 backdrop-blur-md">
        <LocaleNav appName={common("appName")} items={navItems} brandHref="/dashboard" />
      </header>
      {children}
      <MobileBottomNav
        dashboardLabel={nav("dashboard")}
        timelineLabel={dashboard("viewTimeline")}
        settingsLabel={nav("settings")}
      />
    </div>
  );
}
