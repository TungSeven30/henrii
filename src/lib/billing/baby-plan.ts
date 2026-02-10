import type { UserPlan } from "./plan";

type SupabaseLike = {
  from: (table: string) => unknown;
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: boolean | null; error: { message: string } | null }>;
};

export async function getBabyPremiumStatus({
  supabase,
  babyId,
}: {
  supabase: SupabaseLike;
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
  supabase: SupabaseLike;
  babyId: string;
  userId: string;
}): Promise<{ isOwner: boolean; isCaregiver: boolean }> {
  const babyQuery = supabase.from("babies") as {
    select: (columns: string) => {
      eq: (
        column: string,
        value: unknown,
      ) => { single: () => Promise<{ data: { owner_id: string } | null; error: { message: string } | null }> };
    };
  };

  const { data: baby } = await babyQuery.select("owner_id").eq("id", babyId).single();
  if (!baby) {
    return { isOwner: false, isCaregiver: false };
  }

  if (baby.owner_id === userId) {
    return { isOwner: true, isCaregiver: false };
  }

  const caregiverQuery = supabase.from("caregivers") as {
    select: (columns: string) => {
      eq: (
        column: string,
        value: unknown,
      ) => {
        eq: (
          column: string,
          value: unknown,
        ) => {
          eq: (
            column: string,
            value: unknown,
          ) => { maybeSingle: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> };
        };
      };
    };
  };

  const { data: caregiver } = await caregiverQuery
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
  supabase: SupabaseLike;
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
