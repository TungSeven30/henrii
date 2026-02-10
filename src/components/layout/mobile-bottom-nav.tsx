"use client";

import { Suspense } from "react";
import { Clock3, LayoutGrid, Settings } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

type MobileBottomNavProps = {
  dashboardLabel: string;
  timelineLabel: string;
  settingsLabel: string;
};

function isHiddenPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/invite/")
  );
}

export function MobileBottomNav({
  dashboardLabel,
  timelineLabel,
  settingsLabel,
}: MobileBottomNavProps) {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner
        dashboardLabel={dashboardLabel}
        timelineLabel={timelineLabel}
        settingsLabel={settingsLabel}
      />
    </Suspense>
  );
}

function MobileBottomNavInner({
  dashboardLabel,
  timelineLabel,
  settingsLabel,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (isHiddenPath(pathname)) {
    return null;
  }

  const view = searchParams.get("view");
  const dashboardActive = pathname.startsWith("/dashboard") && view !== "timeline";
  const timelineActive = pathname.startsWith("/dashboard") && view === "timeline";
  const settingsActive = pathname.startsWith("/settings");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur">
      <ul className="grid grid-cols-3 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
        <li>
          <Link
            href="/dashboard"
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold",
              dashboardActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            {dashboardLabel}
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard?view=timeline"
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold",
              timelineActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Clock3 className="h-4 w-4" />
            {timelineLabel}
          </Link>
        </li>
        <li>
          <Link
            href="/settings"
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold",
              settingsActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Settings className="h-4 w-4" />
            {settingsLabel}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
