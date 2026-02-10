import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInWithEmailAction, signInWithGoogleAction } from "../../auth-actions";

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ checkEmail?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

function getSignInErrorMessage(code: string | undefined) {
  switch (code) {
    case "oauth_failed":
      return "Google sign-in failed. Please try again.";
    case "missing_email":
      return "Please enter an email address.";
    case "email_signin_failed":
      return "Unable to send magic link. Check your Supabase email setup.";
    case "unauthorized":
      return "Your session expired. Please sign in again.";
    case "missing_code":
      return "Magic link is invalid or incomplete. Request a new link and open it in the same browser where you requested it.";
    case "callback_exchange_failed":
      return "Magic link was invalid or expired. Please request a new email link.";
    case "missing_user":
      return "Unable to complete sign-in. Please request a new email link.";
    default:
      return null;
  }
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "auth" });
  const alternateLocale = routing.locales.find((value) => value !== locale) ?? "en";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_baby_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.active_baby_id) {
      redirect(`/${locale}/dashboard`);
    }

    redirect(`/${locale}/onboarding`);
  }

  const showCheckEmail = query.checkEmail === "1";
  const signInError = getSignInErrorMessage(query.error);
  const mailpitUrl = "http://127.0.0.1:54324";

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,color-mix(in_srgb,var(--color-henrii-cream)_45%,transparent),transparent_42%),radial-gradient(circle_at_82%_12%,color-mix(in_srgb,var(--color-henrii-blue)_35%,transparent),transparent_35%),linear-gradient(180deg,color-mix(in_srgb,var(--background)_95%,white),var(--background))]" />
      <section className="mx-auto grid min-h-[calc(100dvh-65px)] w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-2 md:items-center md:py-12">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
            Nursery Storybook Edition
          </span>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>

          {showCheckEmail ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
              Magic link sent. In local development, open{" "}
              <a className="underline" href={mailpitUrl} target="_blank" rel="noreferrer">
                {mailpitUrl}
              </a>{" "}
              and click the latest sign-in email.
            </div>
          ) : null}
          {signInError ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {signInError}
            </div>
          ) : null}

          <div className="space-y-3">
            <form action={signInWithGoogleAction}>
              <input type="hidden" name="locale" value={locale} />
              <button
                className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95 sm:w-auto"
                type="submit"
              >
                {t("ctaPrimary")}
              </button>
            </form>
            <form action={signInWithEmailAction} className="flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="locale" value={locale} />
              <input
                className="h-11 flex-1 rounded-full border border-border bg-card/90 px-4 text-sm"
                name="email"
                type="email"
                placeholder="parent@example.com"
                required
              />
              <button
                className="h-11 rounded-full border border-border bg-background px-5 text-sm font-semibold transition hover:bg-accent"
                type="submit"
              >
                {t("ctaSecondary")}
              </button>
            </form>
          </div>
        </div>

        <aside className="space-y-3 rounded-3xl border border-border/70 bg-card/85 p-5 shadow-lg backdrop-blur">
          <h2 className="font-heading text-xl font-semibold">{t("createBaby")}</h2>
          <p className="text-sm text-muted-foreground">
            Create one profile, then everything starts flowing: quick logs, trend summaries, caregiver context, and pediatric-ready exports.
          </p>
          <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
            <p>• One-tap feed, sleep, diaper logging</p>
            <p>• Offline queue with sync + conflict review</p>
            <p>• Vaccinations, growth, milestones, appointments</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link className="rounded-full bg-accent px-3 py-1.5 text-sm" href="/dashboard">
              Dashboard
            </Link>
            <Link className="rounded-full bg-accent px-3 py-1.5 text-sm" href="/privacy">
              Privacy
            </Link>
            <Link className="rounded-full bg-accent px-3 py-1.5 text-sm" href="/" locale={alternateLocale}>
              Switch to {alternateLocale.toUpperCase()}
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
