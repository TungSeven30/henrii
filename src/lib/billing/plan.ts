import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type UserPlan = "free" | "premium";

type SubscriptionRow = {
  plan: string;
  status: string;
  current_period_end: string | null;
};

export function hasPremiumAccess(subscription: SubscriptionRow | null): boolean {
  if (!subscription) {
    return false;
  }

  if (subscription.plan !== "premium") {
    return false;
  }

  return subscription.status === "active";
}

type AppSupabaseClient = SupabaseClient<Database>;

export async function getUserPlan({
  supabase,
  userId,
}: {
  supabase: AppSupabaseClient;
  userId: string;
}): Promise<{ plan: UserPlan; premium: boolean }> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return {
      plan: "free",
      premium: false,
    };
  }

  const plan: UserPlan = data.plan === "premium" ? "premium" : "free";
  return {
    plan,
    premium: hasPremiumAccess(data),
  };
}
