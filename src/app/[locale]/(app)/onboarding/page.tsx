import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createBabyProfileAction } from "../../auth-actions";

type OnboardingPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; deleted?: string }>;
};

export const dynamic = "force-dynamic";

function getOnboardingErrorMessage(code: string | undefined) {
  switch (code) {
    case "missing_fields":
      return "Please fill baby name and date of birth.";
    case "baby_create_failed":
      return "Unable to create baby profile. Please try again.";
    case "profile_update_failed":
      return "Unable to save your active baby profile. Please try again.";
    case "invalid_dob":
      return "Date of birth must be a valid date and cannot be in the future.";
    case "unauthorized":
      return "Your session expired. Please sign in again.";
    default:
      return null;
  }
}

export default async function OnboardingPage({ params, searchParams }: OnboardingPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "auth" });
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.active_baby_id) {
    redirect(`/${locale}/dashboard`);
  }

  const errorMessage = getOnboardingErrorMessage(query.error);
  const showDeletedMessage = query.deleted === "1";
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <main className="henrii-page-form">
      <section className="henrii-card space-y-6">
        <header className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight">{t("createBaby")}</h1>
          <p className="text-sm text-muted-foreground">
            Create your baby profile to unlock quick logging, dashboard summaries, and
            sharing with caregivers.
          </p>
        </header>
        {errorMessage ? (
          <p className="henrii-feedback-error">{errorMessage}</p>
        ) : null}
        {showDeletedMessage ? (
          <p className="henrii-feedback-success">
            Baby profile deleted. Create a new profile to continue.
          </p>
        ) : null}

        <form action={createBabyProfileAction} className="grid gap-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="grid gap-1 text-sm">
            Baby name
            <input
              name="name"
              required
              className="henrii-input"
              placeholder="Henry"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Date of birth
            <input
              name="dateOfBirth"
              required
              type="date"
              max={todayIso}
              className="henrii-input"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1 text-sm">
              Sex
              <select name="sex" className="henrii-select">
                <option value="unknown">Unknown</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Country
              <select
                name="countryCode"
                className="henrii-select"
                defaultValue="US"
              >
                <option value="US">US</option>
                <option value="VN">VN</option>
                <option value="GB">GB</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Timezone
              <select
                name="timezone"
                className="henrii-select"
                defaultValue="UTC"
              >
                <option value="UTC">UTC</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
              </select>
            </label>
          </div>
          <button type="submit" className="henrii-btn-primary mt-2 h-11">
            Continue to dashboard
          </button>
        </form>
      </section>
    </main>
  );
}
