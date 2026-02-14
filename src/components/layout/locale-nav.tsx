"use client";

import { type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type LocaleNavProps = {
  appName: string;
  items: NavItem[];
  brandHref?: string;
  children?: ReactNode;
};

function isActivePath(pathname: string, href: string) {
  const hrefPath = href.split("?")[0] ?? href;

  if (hrefPath === "/") {
    return pathname === "/";
  }

  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

export function LocaleNav({
  appName,
  items,
  brandHref = "/",
  children,
}: LocaleNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <Link className="font-heading text-2xl font-extrabold tracking-tight" href={brandHref}>
        {appName}
      </Link>

      <div className="flex max-w-[65%] items-center gap-1 overflow-x-auto text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-9 items-center whitespace-nowrap rounded-full border px-3 text-[12px] font-semibold transition",
                active
                  ? "border-primary/35 bg-primary/15 text-foreground"
                  : "border-border/70 text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {children ? <div className="ml-2 flex items-center">{children}</div> : null}
    </nav>
  );
}
