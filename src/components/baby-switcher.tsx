"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBabyStore, type Baby } from "@/stores/baby-store";
import { createClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BabySwitcher() {
  const t = useTranslations("baby");
  const router = useRouter();
  const activeBaby = useBabyStore((s) => s.activeBaby);
  const allBabies = useBabyStore((s) => s.allBabies);
  const setActiveBaby = useBabyStore((s) => s.setActiveBaby);
  const setAllBabies = useBabyStore((s) => s.setAllBabies);

  useEffect(() => {
    async function fetchBabies() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [ownedResult, caregiverResult] = await Promise.all([
        supabase.from("babies").select("*").eq("owner_id", user.id),
        supabase
          .from("caregivers")
          .select("baby_id, babies(*)")
          .eq("user_id", user.id)
          .eq("invite_status", "accepted"),
      ]);

      const owned: Baby[] = ownedResult.data ?? [];
      const caregiverBabies: Baby[] = (caregiverResult.data ?? [])
        .map((row) => row.babies as unknown as Baby)
        .filter(Boolean);

      // Deduplicate by id
      const babyMap = new Map<string, Baby>();
      for (const baby of [...owned, ...caregiverBabies]) {
        babyMap.set(baby.id, baby);
      }
      const merged = Array.from(babyMap.values());

      setAllBabies(merged);

      // If no active baby or active baby not in the list, pick the first one
      const currentActive = useBabyStore.getState().activeBaby;
      if (!currentActive || !merged.some((b) => b.id === currentActive.id)) {
        if (merged.length > 0) {
          setActiveBaby(merged[0]);
        }
      }
    }

    fetchBabies();
  }, [setActiveBaby, setAllBabies]);

  if (!activeBaby) return null;

  function handleSwitch(baby: Baby) {
    setActiveBaby(baby);
    router.refresh();
    toast.success(t("switchedTo", { name: baby.name }));
  }

  const initial = activeBaby.name[0]?.toUpperCase() ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 outline-none rounded-full px-1.5 py-1 transition-colors hover:bg-accent">
          <Avatar size="sm">
            {activeBaby.photo_url && (
              <AvatarImage src={activeBaby.photo_url} alt={activeBaby.name} />
            )}
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate max-w-[100px]">
            {activeBaby.name}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {allBabies.map((baby) => {
          const isActive = baby.id === activeBaby.id;
          const babyInitial = baby.name[0]?.toUpperCase() ?? "?";
          return (
            <DropdownMenuItem
              key={baby.id}
              onClick={() => {
                if (!isActive) handleSwitch(baby);
              }}
              className="flex items-center gap-2"
            >
              <Avatar size="sm">
                {baby.photo_url && (
                  <AvatarImage src={baby.photo_url} alt={baby.name} />
                )}
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {babyInitial}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-sm">{baby.name}</span>
              {isActive && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/baby/new" className="flex items-center gap-2">
            <Plus className="size-4" />
            {t("addBaby")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
