import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return null;
  }

  const { url } = getSupabasePublicEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
