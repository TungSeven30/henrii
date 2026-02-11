import { redirect } from "next/navigation";
import { ActiveBabyHydrator } from "@/components/baby/active-baby-hydrator";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsContent } from "./settings-content";

type SettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
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

  const activeBabyId = profile?.active_baby_id ?? null;
  const { data: baby } = activeBabyId
    ? await supabase
        .from("babies")
        .select("*")
        .eq("id", activeBabyId)
        .maybeSingle()
    : { data: null };

  return (
    <main className="henrii-page-narrow">
      <ActiveBabyHydrator
        activeBabyId={activeBabyId}
        activeBaby={
          baby
            ? {
                id: baby.id,
                name: baby.name,
                date_of_birth: baby.date_of_birth,
                sex: baby.sex ?? null,
                country_code: baby.country_code,
                timezone: baby.timezone,
                owner_id: baby.owner_id,
                photo_url: (baby as { photo_url?: string | null }).photo_url ?? null,
              }
            : null
        }
      />
      <SettingsContent userEmail={user.email ?? null} />
    </main>
  );
}
