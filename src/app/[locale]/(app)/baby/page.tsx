import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
<<<<<<< HEAD
=======
import { BabyPhotoManager } from "@/components/baby/baby-photo-manager";
>>>>>>> security-audit-2026-02-11
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteBabyProfileAction, updateBabyProfileAction } from "../../auth-actions";

type BabyProfilePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
};

export const dynamic = "force-dynamic";

function getBabyErrorMessage(code: string | undefined) {
  switch (code) {
    case "missing_fields":
      return "Please fill all required fields.";
    case "invalid_dob":
      return "Date of birth must be a valid date and cannot be in the future.";
    case "unauthorized":
      return "Your session expired. Please sign in again.";
    case "update_failed":
      return "Unable to update baby profile. Please try again.";
    case "missing_baby":
      return "Missing baby profile.";
    case "unlink_failed":
      return "Unable to unlink active baby profile.";
    case "delete_failed":
      return "Unable to delete baby profile.";
    default:
      return null;
  }
}

export default async function BabyProfilePage({ params, searchParams }: BabyProfilePageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "baby" });
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

  if (!profile?.active_baby_id) {
    redirect(`/${locale}/onboarding`);
  }

  const { data: baby } = await supabase
    .from("babies")
<<<<<<< HEAD
    .select("id, name, date_of_birth, sex, country_code, timezone")
=======
    .select("id, name, date_of_birth, sex, country_code, timezone, photo_url")
>>>>>>> security-audit-2026-02-11
    .eq("id", profile.active_baby_id)
    .single();

  if (!baby) {
    redirect(`/${locale}/onboarding`);
  }

  const errorMessage = getBabyErrorMessage(query.error);
  const showSavedMessage = query.saved === "1";
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <main className="henrii-page-narrow">
      <h1 className="henrii-title">{t("title")}</h1>
      {errorMessage ? (
        <p className="henrii-feedback-error">{errorMessage}</p>
      ) : null}
      {showSavedMessage ? (
        <p className="henrii-feedback-success">Baby profile saved.</p>
      ) : null}
      <section className="henrii-card">
<<<<<<< HEAD
=======
        <BabyPhotoManager babyId={baby.id} initialPhotoUrl={baby.photo_url ?? null} />
      </section>
      <section className="henrii-card">
>>>>>>> security-audit-2026-02-11
        <form action={updateBabyProfileAction} className="grid gap-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="babyId" value={baby.id} />
          <label className="grid gap-1 text-sm">
            {t("name")}
            <input
              name="name"
              defaultValue={baby.name}
              required
              className="henrii-input"
            />
          </label>
          <label className="grid gap-1 text-sm">
            {t("dateOfBirth")}
            <input
              name="dateOfBirth"
              type="date"
              defaultValue={baby.date_of_birth}
              max={todayIso}
              required
              className="henrii-input"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1 text-sm">
              {t("sex")}
              <select
                name="sex"
                defaultValue={baby.sex ?? "unknown"}
                className="henrii-select"
              >
                <option value="unknown">Unknown</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              {t("country")}
              <select
                name="countryCode"
                defaultValue={baby.country_code ?? "US"}
                className="henrii-select"
              >
                <option value="US">US</option>
                <option value="VN">VN</option>
                <option value="GB">GB</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              {t("timezone")}
              <select
                name="timezone"
                defaultValue={baby.timezone ?? "UTC"}
                className="henrii-select"
              >
                <option value="UTC">UTC</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
              </select>
            </label>
          </div>
          <button type="submit" className="henrii-btn-primary">
            {t("save")}
          </button>
        </form>
      </section>
      <section className="henrii-card-danger">
        <h2 className="font-heading text-xl font-semibold">{t("dangerTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("dangerBody")}</p>
        <form action={deleteBabyProfileAction} className="mt-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="babyId" value={baby.id} />
          <button type="submit" className="henrii-btn-danger">
            {t("delete")}
          </button>
        </form>
      </section>
    </main>
  );
}
