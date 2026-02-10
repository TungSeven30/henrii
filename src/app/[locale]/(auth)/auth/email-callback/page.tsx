"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routing } from "@/i18n/routing";

function getSafeLocale(rawLocale: string | undefined): string {
  if (rawLocale && routing.locales.includes(rawLocale as "en" | "vi")) {
    return rawLocale;
  }

  return routing.defaultLocale;
}

export default function EmailCallbackPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = getSafeLocale(
    typeof params.locale === "string" ? params.locale : routing.defaultLocale,
  );

  useEffect(() => {
    const run = async () => {
      const supabase = createSupabaseBrowserClient();
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const queryError = queryParams.get("error");
      const hashError = hashParams.get("error");
      const code = queryParams.get("code");

      if (queryError || hashError) {
        router.replace(`/${locale}/login?error=callback_exchange_failed`);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          router.replace(`/${locale}/login?error=callback_exchange_failed`);
          return;
        }
      } else {
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          router.replace(`/${locale}/login?error=missing_code`);
          return;
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          router.replace(`/${locale}/login?error=callback_exchange_failed`);
          return;
        }
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace(`/${locale}/login?error=missing_user`);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("active_baby_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.active_baby_id) {
        router.replace(`/${locale}/onboarding`);
        return;
      }

      router.replace(`/${locale}/dashboard`);
    };

    run();
  }, [locale, router]);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-65px)] w-full max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-xl rounded-3xl border border-border/60 bg-card/80 p-6 text-center shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Completing sign-in...</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we finish your email sign-in.
        </p>
      </section>
    </main>
  );
}
