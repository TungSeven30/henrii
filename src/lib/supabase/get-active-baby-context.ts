import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./server";

type ActiveBabyContext = {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userId: string;
  activeBabyId: string;
};

export async function getActiveBabyContext(locale: string): Promise<ActiveBabyContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active_baby_id) {
    redirect(`/${locale}/onboarding`);
  }

  return {
    supabase,
    userId: user.id,
    activeBabyId: profile.active_baby_id,
  };
}
