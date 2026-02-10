"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useBabyStore } from "@/stores/baby-store";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const EVENT_TYPES = [
  "vaccination",
  "appointment",
  "feeding_gap",
  "diaper_gap",
  "milestone",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

interface Preference {
  id: string | null;
  event_type: EventType;
  email_enabled: boolean;
  push_enabled: boolean;
}

function getDefaultPreferences(): Preference[] {
  return EVENT_TYPES.map((type) => ({
    id: null,
    event_type: type,
    email_enabled: true,
    push_enabled: false,
  }));
}

const EVENT_TYPE_TRANSLATION_KEYS: Record<EventType, string> = {
  vaccination: "vaccination",
  appointment: "appointment",
  feeding_gap: "feedingGap",
  diaper_gap: "diaperGap",
  milestone: "milestone",
};

async function registerPushSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return null;

  // The Push API accepts URL-safe base64 VAPID keys directly as strings
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidKey,
  });

  return subscription;
}

export function NotificationPreferences() {
  const t = useTranslations("notifications");
  const activeBaby = useBabyStore((s) => s.activeBaby);

  const [preferences, setPreferences] = useState<Preference[]>(
    getDefaultPreferences,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [pushRegistered, setPushRegistered] = useState(false);

  const fetchPreferences = useCallback(async () => {
    const baby = useBabyStore.getState().activeBaby;
    if (!baby) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("notification_preferences")
      .select("id, event_type, email_enabled, push_enabled")
      .eq("baby_id", baby.id);

    if (data && data.length > 0) {
      const fetched = data as {
        id: string;
        event_type: EventType;
        email_enabled: boolean;
        push_enabled: boolean;
      }[];

      const merged = EVENT_TYPES.map((type) => {
        const existing = fetched.find((p) => p.event_type === type);
        if (existing) {
          return {
            id: existing.id,
            event_type: type,
            email_enabled: existing.email_enabled,
            push_enabled: existing.push_enabled,
          };
        }
        return {
          id: null,
          event_type: type,
          email_enabled: true,
          push_enabled: false,
        };
      });
      setPreferences(merged);

      // Check if any push is already enabled
      const hasPush = fetched.some((p) => p.push_enabled);
      setPushRegistered(hasPush);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPreferences();
  }, [fetchPreferences]);

  async function handleToggle(
    eventType: EventType,
    field: "email_enabled" | "push_enabled",
    newValue: boolean,
  ) {
    const baby = useBabyStore.getState().activeBaby;
    if (!baby) return;

    // If enabling push for the first time, request permission and register
    if (field === "push_enabled" && newValue && !pushRegistered) {
      if (!("Notification" in window)) {
        toast.error(t("pushNotSupported"));
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        toast.error(t("permissionDenied"));
        return;
      }
      if (permission !== "granted") {
        toast.error(t("permissionRequired"));
        return;
      }

      const subscription = await registerPushSubscription();
      if (!subscription) {
        toast.error(t("pushNotSupported"));
        return;
      }

      // Send subscription to server
      const subJson = subscription.toJSON();
      const keys = subJson.keys as { p256dh: string; auth: string } | undefined;

      if (!keys) {
        toast.error(t("pushNotSupported"));
        return;
      }

      const res = await fetch("/api/notifications/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: { p256dh: keys.p256dh, auth: keys.auth },
        }),
      });

      if (!res.ok) {
        toast.error(t("saveError"));
        return;
      }

      setPushRegistered(true);
    }

    const savingKey = `${eventType}-${field}`;
    setSaving(savingKey);

    // Optimistic update
    setPreferences((prev) =>
      prev.map((p) =>
        p.event_type === eventType ? { ...p, [field]: newValue } : p,
      ),
    );

    const pref = preferences.find((p) => p.event_type === eventType);
    if (!pref) return;

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(null);
      return;
    }

    const payload = {
      user_id: user.id,
      baby_id: baby.id,
      event_type: eventType,
      email_enabled: field === "email_enabled" ? newValue : pref.email_enabled,
      push_enabled: field === "push_enabled" ? newValue : pref.push_enabled,
    };

    if (pref.id) {
      // Update existing
      const { error } = await supabase
        .from("notification_preferences")
        .update({
          email_enabled: payload.email_enabled,
          push_enabled: payload.push_enabled,
        })
        .eq("id", pref.id);

      if (error) {
        // Revert optimistic update
        setPreferences((prev) =>
          prev.map((p) =>
            p.event_type === eventType ? { ...p, [field]: !newValue } : p,
          ),
        );
        toast.error(t("saveError"));
        setSaving(null);
        return;
      }
    } else {
      // Insert new
      const { data: inserted, error } = await supabase
        .from("notification_preferences")
        .insert(payload)
        .select("id")
        .single();

      if (error || !inserted) {
        setPreferences((prev) =>
          prev.map((p) =>
            p.event_type === eventType ? { ...p, [field]: !newValue } : p,
          ),
        );
        toast.error(t("saveError"));
        setSaving(null);
        return;
      }

      // Update local state with the new id
      const insertedRow = inserted as { id: string };
      setPreferences((prev) =>
        prev.map((p) =>
          p.event_type === eventType ? { ...p, id: insertedRow.id } : p,
        ),
      );
    }

    toast.success(t("saved"));
    setSaving(null);
  }

  if (!activeBaby) return null;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-primary" />
            <span className="text-sm font-medium">{t("title")}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {activeBaby.name}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-1 pb-2">
              <span className="text-xs font-medium text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground text-center w-14">
                {t("email")}
              </span>
              <span className="text-xs font-medium text-muted-foreground text-center w-14">
                {t("push")}
              </span>
            </div>

            {preferences.map((pref) => {
              const translationKey = EVENT_TYPE_TRANSLATION_KEYS[pref.event_type];

              return (
                <div
                  key={pref.event_type}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 items-center rounded-lg border px-3 py-2.5"
                >
                  <Label className="text-sm font-medium cursor-default">
                    {t(translationKey)}
                  </Label>

                  <div className="flex justify-center w-14">
                    <Switch
                      checked={pref.email_enabled}
                      onCheckedChange={(checked: boolean) =>
                        handleToggle(pref.event_type, "email_enabled", checked)
                      }
                      disabled={saving !== null}
                      aria-label={`${t("email")} ${t(translationKey)}`}
                    />
                  </div>

                  <div className="flex justify-center w-14">
                    <Switch
                      checked={pref.push_enabled}
                      onCheckedChange={(checked: boolean) =>
                        handleToggle(pref.event_type, "push_enabled", checked)
                      }
                      disabled={saving !== null}
                      aria-label={`${t("push")} ${t(translationKey)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
