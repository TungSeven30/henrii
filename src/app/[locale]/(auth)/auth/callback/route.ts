import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

type RouteContext = {
  params: Promise<{ locale: string }>;
};

function getSafeLocale(rawLocale: string): string {
  if (routing.locales.includes(rawLocale as "en" | "vi")) {
    return rawLocale;
  }

  return routing.defaultLocale;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { locale: rawLocale } = await context.params;
  const locale = getSafeLocale(rawLocale);
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNextPath = requestUrl.searchParams.get("next") ?? "dashboard";
  const nextPath = ["dashboard", "settings", "onboarding"].includes(requestedNextPath)
    ? requestedNextPath
    : "dashboard";

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=missing_code`, requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=callback_exchange_failed`, requestUrl.origin),
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=missing_user`, requestUrl.origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active_baby_id) {
    return NextResponse.redirect(new URL(`/${locale}/onboarding`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(`/${locale}/${nextPath}`, requestUrl.origin));
}
