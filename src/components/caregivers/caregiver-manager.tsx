"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Users, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useBabyStore } from "@/stores/baby-store";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSubscription } from "@/hooks/use-subscription";
import { UpgradePrompt } from "@/components/paywall/upgrade-prompt";

interface CaregiverProfile {
  id: string;
  full_name: string | null;
}

interface Caregiver {
  id: string;
  user_id: string | null;
  email: string;
  role: string;
  invite_status: string;
  invited_at: string;
  accepted_at: string | null;
  profile: CaregiverProfile | null;
}

function getInitials(profile: CaregiverProfile | null, email: string): string {
  if (profile?.full_name) {
    return profile.full_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

function StatusBadge({
  status,
  t,
}: {
  status: string;
  t: ReturnType<typeof useTranslations<"caregivers">>;
}) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
        >
          {t("pending")}
        </Badge>
      );
    case "accepted":
      return (
        <Badge
          variant="outline"
          className="border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300"
        >
          {t("accepted")}
        </Badge>
      );
    case "revoked":
      return (
        <Badge
          variant="outline"
          className="border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400"
        >
          {t("revoked")}
        </Badge>
      );
    default:
      return null;
  }
}

function RoleBadge({
  role,
  t,
}: {
  role: string;
  t: ReturnType<typeof useTranslations<"caregivers">>;
}) {
  if (role === "admin") {
    return <Badge variant="default">{t("admin")}</Badge>;
  }
  return <Badge variant="secondary">{t("caregiver")}</Badge>;
}

export function CaregiverManager() {
  const t = useTranslations("caregivers");
  const locale = useLocale();
  const router = useRouter();
  const { isPremium, loading: subLoading } = useSubscription();

  const activeBaby = useBabyStore((s) => s.activeBaby);

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const fetchCaregivers = useCallback(async () => {
    const baby = useBabyStore.getState().activeBaby;
    if (!baby) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("caregivers")
      .select("id, user_id, email, role, invite_status, invited_at, accepted_at")
      .eq("baby_id", baby.id)
      .neq("invite_status", "revoked")
      .order("invited_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const caregiverRows = data as Omit<Caregiver, "profile">[];
    const userIds = caregiverRows
      .map((cg) => cg.user_id)
      .filter((value): value is string => Boolean(value));

    let profilesById = new Map<string, CaregiverProfile>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      profilesById = new Map(
        (profiles ?? []).map((profile) => [
          profile.id as string,
          {
            id: profile.id as string,
            full_name: (profile as { full_name: string | null }).full_name,
          },
        ]),
      );
    }

    const merged = caregiverRows.map((caregiver) => ({
      ...caregiver,
      profile: caregiver.user_id ? profilesById.get(caregiver.user_id) ?? null : null,
    }));

    setCaregivers(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCaregivers();
  }, [fetchCaregivers]);

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();

    if (!activeBaby || !email.trim()) return;

    setSending(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          role: "caregiver",
          locale,
        }),
      });

      if (res.status === 429) {
        toast.error(t("rateLimit"));
        return;
      }

      if (res.status === 409) {
        toast.error(t("alreadyCaregiver"));
        return;
      }

      if (!res.ok) {
        toast.error(t("inviteError"));
        return;
      }

      toast.success(t("inviteSent"));
      setEmail("");
      setSheetOpen(false);
      await fetchCaregivers();
      router.refresh();
    } catch {
      toast.error(t("inviteError"));
    } finally {
      setSending(false);
    }
  }

  async function handleRevoke(caregiverId: string) {
    setConfirmRevokeId(null);
    setRevokingId(caregiverId);

    try {
      const res = await fetch("/api/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caregiverId }),
      });

      if (!res.ok) {
        toast.error(t("inviteError"));
        return;
      }

      toast.success(t("revokeSuccess"));
      await fetchCaregivers();
      router.refresh();
    } catch {
      toast.error(t("inviteError"));
    } finally {
      setRevokingId(null);
    }
  }

  if (!activeBaby) return null;

  if (subLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isPremium) {
    return <UpgradePrompt featureName="caregiverInvites" />;
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="size-5 text-primary" />
            <span className="text-sm font-medium">{t("title")}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {activeBaby.name}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : caregivers.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("noCaregivers")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("noCaregiversSubtitle")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {caregivers.map((cg) => (
              <div
                key={cg.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar size="default">
                  <AvatarFallback>
                    {getInitials(cg.profile, cg.email)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {cg.profile?.full_name && (
                    <p className="text-sm font-medium truncate">
                      {cg.profile.full_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {cg.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={cg.invite_status} t={t} />
                  <RoleBadge role={cg.role} t={t} />
                  {cg.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmRevokeId(cg.id)}
                      disabled={revokingId === cg.id}
                    >
                      {revokingId === cg.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <X className="size-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSheetOpen(true)}
          >
            <UserPlus className="size-4" />
            {t("invite")}
          </Button>

          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>{t("invite")}</SheetTitle>
              <SheetDescription>{t("inviteSubtitle")}</SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSendInvite} className="space-y-4 px-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="caregiver-email">{t("email")}</Label>
                <Input
                  id="caregiver-email"
                  type="email"
                  required
                  placeholder="grandma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSheetOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={sending || !email.trim()}
                >
                  {sending && <Loader2 className="size-4 animate-spin" />}
                  {t("sendInvite")}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        <AlertDialog
          open={confirmRevokeId !== null}
          onOpenChange={(open) => {
            if (!open) setConfirmRevokeId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmRevokeTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirmRevoke")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmRevokeId) handleRevoke(confirmRevokeId);
                }}
              >
                {t("revoke")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
