import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getSafeLocale(rawLocale: string | null) {
  if (rawLocale && routing.locales.includes(rawLocale as "en" | "vi")) {
    return rawLocale;
  }

  return routing.defaultLocale;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const locale = getSafeLocale(requestUrl.searchParams.get("locale"));
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL(`/${locale}?error=unauthorized`, requestUrl.origin), 303);
  }

  const now = new Date();
  const purgeAfter = new Date(now.getTime() + THIRTY_DAYS_MS);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      deleted_at: now.toISOString(),
      purge_after: purgeAfter.toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.redirect(
      new URL(`/${locale}/settings?error=delete_profile_failed`, requestUrl.origin),
      303,
    );
  }

  await supabase.from("deletion_jobs").insert({
    profile_id: user.id,
    status: "pending",
    scheduled_for: purgeAfter.toISOString(),
  });

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(`/${locale}?accountDeleted=1`, requestUrl.origin), 303);
}
