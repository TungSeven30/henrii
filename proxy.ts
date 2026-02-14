import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/auth",
  "/privacy",
  "/terms",
  "/invite",
  "/site",
  "/blog",
];

function isPublicPath(pathname: string) {
  const pathWithoutLocale = pathname.replace(/^\/(en|vi)/, "") || "/";
  return PUBLIC_PATHS.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`),
  );
}

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    return { user: null, supabaseResponse };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabaseResponse };
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(request);

  if (isPublicPath(pathname)) {
    return intlResponse;
  }

  const { user, supabaseResponse } = await updateSession(request);
  if (!user) {
    const locale = pathname.match(/^\/(en|vi)/)?.[1] ?? "en";
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
