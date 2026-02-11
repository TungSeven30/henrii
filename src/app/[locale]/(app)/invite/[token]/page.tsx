import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { acceptInviteAction } from "./actions";

type InvitePageProps = {
  params: Promise<{ locale: string; token: string }>;
};

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: InvitePageProps) {
  const { locale, token } = await params;
  const t = await getTranslations({ locale, namespace: "invite" });
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invite } = await supabase
    .from("caregiver_invites")
    .select("email, role, expires_at, accepted_at, revoked_at, baby_id")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{t("invalidTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("invalidBody")}</p>
      </main>
    );
  }

  const revoked = Boolean(invite.revoked_at);
  const alreadyAccepted = Boolean(invite.accepted_at);

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("summary")} {invite.email} · {invite.role}
        </p>

        {!user ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("loginRequired")}</p>
        ) : revoked ? (
          <p className="mt-4 text-sm text-destructive">{t("expired")}</p>
        ) : alreadyAccepted ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("alreadyAccepted")}</p>
        ) : (
          <form action={acceptInviteAction} className="mt-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("accept")}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
