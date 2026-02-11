import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Subscription {
  plan: "free" | "premium";
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      setSubscription(
        data
          ? {
              plan: data.plan as "free" | "premium",
              status: data.status as "active" | "canceled" | "past_due",
              currentPeriodEnd: data.current_period_end as string | null,
            }
          : { plan: "free", status: "active", currentPeriodEnd: null },
      );
      setLoading(false);
    }

    void fetchSubscription();
  }, []);

  const isPremium =
    subscription?.plan === "premium" && subscription?.status === "active";

  return { subscription, loading, isPremium };
}
