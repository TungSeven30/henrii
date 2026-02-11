"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CreditCard, Loader2, AlertTriangle, Crown } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Subscription {
  plan: "free" | "premium";
  status: "active" | "canceled" | "past_due";
  current_period_end: string | null;
}

export function SubscriptionCard() {
  const t = useTranslations("subscription");
  const locale = useLocale();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const fetchSubscription = useCallback(async () => {
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

    if (data) {
      const row = data as {
        plan: string;
        status: string;
        current_period_end: string | null;
      };
      setSubscription({
        plan: row.plan as "free" | "premium",
        status: row.status as "active" | "canceled" | "past_due",
        current_period_end: row.current_period_end,
      });
    } else {
      // No subscription row means free plan
      setSubscription({ plan: "free", status: "active", current_period_end: null });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSubscription();
  }, [fetchSubscription]);

  async function handleUpgrade() {
    setRedirecting(true);
    try {
      const res = await fetch(`/api/stripe/checkout?locale=${locale}`, { method: "POST" });
      if (!res.ok) {
        toast.error(t("error"));
        setRedirecting(false);
        return;
      }
      const body = (await res.json()) as { url?: string };
      if (body.url) {
        window.location.href = body.url;
      } else {
        toast.error(t("error"));
        setRedirecting(false);
      }
    } catch {
      toast.error(t("error"));
      setRedirecting(false);
    }
  }

  async function handleManage() {
    setRedirecting(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) {
        toast.error(t("error"));
        setRedirecting(false);
        return;
      }
      const body = (await res.json()) as { url?: string };
      if (body.url) {
        window.location.href = body.url;
      } else {
        toast.error(t("error"));
        setRedirecting(false);
      }
    } catch {
      toast.error(t("error"));
      setRedirecting(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) return null;

  const isFree = subscription.plan === "free";
  const isPremium = subscription.plan === "premium";
  const isCanceled = subscription.status === "canceled";
  const isPastDue = subscription.status === "past_due";

  const formattedDate = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <CreditCard className="size-5 text-primary" />
          <span className="text-sm font-medium">{t("title")}</span>
        </div>

        {/* Current plan badge */}
        <div className="flex items-center gap-2">
          {isPremium && <Crown className="size-4 text-yellow-500" />}
          <span className="text-sm font-medium">
            {isFree ? t("freePlan") : t("premiumPlan")}
          </span>
        </div>

        {/* Past due warning */}
        {isPastDue && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-destructive">{t("pastDueNotice")}</p>
          </div>
        )}

        {/* Canceled notice */}
        {isCanceled && formattedDate && (
          <p className="text-xs text-muted-foreground">
            {t("canceledNotice", { date: formattedDate })}
          </p>
        )}

        {/* Next billing date (active premium only) */}
        {isPremium && !isCanceled && !isPastDue && formattedDate && (
          <p className="text-xs text-muted-foreground">
            {t("nextBilling")}: {formattedDate}
          </p>
        )}

        {/* Action buttons */}
        {isFree && (
          <Button
            className="w-full"
            onClick={handleUpgrade}
            disabled={redirecting}
          >
            {redirecting && <Loader2 className="animate-spin" />}
            {redirecting ? t("upgrading") : t("upgradeButton")}
          </Button>
        )}

        {isPremium && !isPastDue && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleManage}
            disabled={redirecting}
          >
            {redirecting && <Loader2 className="animate-spin" />}
            {redirecting ? t("upgrading") : t("manageButton")}
          </Button>
        )}

        {isPastDue && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleManage}
            disabled={redirecting}
          >
            {redirecting && <Loader2 className="animate-spin" />}
            {redirecting ? t("upgrading") : t("updatePayment")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
