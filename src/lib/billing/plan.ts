export type UserPlan = "free" | "premium";

type SubscriptionRow = {
  plan: UserPlan;
  status: "active" | "canceled" | "past_due" | "incomplete";
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

export async function getUserPlan({
  supabase,
  userId,
}: {
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: unknown) => {
          maybeSingle: () => Promise<{ data: SubscriptionRow | null; error: { message: string } | null }>;
        };
      };
    };
  };
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

  return {
    plan: data.plan,
    premium: hasPremiumAccess(data),
  };
}
