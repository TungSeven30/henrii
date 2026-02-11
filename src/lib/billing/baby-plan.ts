import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { UserPlan } from "./plan";

type AppSupabaseClient = SupabaseClient<Database>;

export async function getBabyPremiumStatus({
  supabase,
  babyId,
}: {
  supabase: AppSupabaseClient;
  babyId: string;
}): Promise<{ plan: UserPlan; premium: boolean }> {
  const { data, error } = await supabase.rpc("baby_has_premium", {
    target_baby_id: babyId,
  });

  if (error) {
    return { plan: "free", premium: false };
  }

  const premium = Boolean(data);
  return {
    plan: premium ? "premium" : "free",
    premium,
  };
}

export async function getBabyMembership({
  supabase,
  babyId,
  userId,
}: {
  supabase: AppSupabaseClient;
  babyId: string;
  userId: string;
}): Promise<{ isOwner: boolean; isCaregiver: boolean }> {
  const { data: baby } = await supabase
    .from("babies")
    .select("owner_id")
    .eq("id", babyId)
    .single();
  if (!baby) {
    return { isOwner: false, isCaregiver: false };
  }

  if (baby.owner_id === userId) {
    return { isOwner: true, isCaregiver: false };
  }

  const { data: caregiver } = await supabase
    .from("caregivers")
    .select("id")
    .eq("baby_id", babyId)
    .eq("user_id", userId)
    .eq("invite_status", "accepted")
    .maybeSingle();

  return { isOwner: false, isCaregiver: Boolean(caregiver) };
}

export async function canWriteToBaby({
  supabase,
  babyId,
  userId,
}: {
  supabase: AppSupabaseClient;
  babyId: string;
  userId?: string;
}): Promise<boolean> {
  const { data, error } = await supabase.rpc("caregiver_write_allowed", {
    target_baby_id: babyId,
  });

  if (error) {
    if (!userId) {
      return false;
    }

    const membership = await getBabyMembership({ supabase, babyId, userId });
    return membership.isOwner || membership.isCaregiver;
  }

  return Boolean(data);
}
