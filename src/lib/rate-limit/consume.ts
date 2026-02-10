export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: string;
};

function getWindowStart(windowMinutes: number, now = new Date()) {
  const totalMinutes = now.getUTCMinutes() + now.getUTCHours() * 60;
  const bucket = Math.floor(totalMinutes / windowMinutes) * windowMinutes;
  const hours = Math.floor(bucket / 60);
  const minutes = bucket % 60;

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      minutes,
      0,
      0,
    ),
  );
}

export async function consumeScopedRateLimit({
  supabase,
  userId,
  scope,
  limit,
  windowMinutes,
}: {
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: unknown) => {
          eq: (column: string, value: unknown) => {
            eq: (column: string, value: unknown) => {
              maybeSingle: () => Promise<{ data: { id: string; count: number } | null; error: { message: string } | null }>;
            };
          };
        };
      };
      insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      update: (values: Record<string, unknown>) => {
        eq: (column: string, value: unknown) => Promise<{ error: { message: string } | null }>;
      };
    };
  };
  userId: string;
  scope: string;
  limit: number;
  windowMinutes: number;
}): Promise<RateLimitResult> {
  const windowStart = getWindowStart(windowMinutes);
  const resetAt = new Date(windowStart.getTime() + windowMinutes * 60 * 1000).toISOString();

  const existing = await supabase
    .from("api_rate_limits")
    .select("id, count")
    .eq("user_id", userId)
    .eq("scope", scope)
    .eq("window_start", windowStart.toISOString())
    .maybeSingle();

  const currentCount = existing.data?.count ?? 0;
  const nextCount = currentCount + 1;

  if (nextCount > limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt,
    };
  }

  if (!existing.data?.id) {
    await supabase.from("api_rate_limits").insert({
      user_id: userId,
      scope,
      window_start: windowStart.toISOString(),
      count: 1,
    });
  } else {
    await supabase
      .from("api_rate_limits")
      .update({ count: nextCount })
      .eq("id", existing.data.id);
  }

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - nextCount),
    resetAt,
  };
}
