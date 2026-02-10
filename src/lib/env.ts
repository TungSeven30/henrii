type RequiredPublicEnvVar =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function getRequiredPublicEnvVar(key: RequiredPublicEnvVar): string {
  const value = process.env[key];

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (key === "NEXT_PUBLIC_SUPABASE_URL") {
    return "http://127.0.0.1:54321";
  }

  return "development-anon-key-placeholder";
}

export function getSupabasePublicEnv() {
  return {
    url: getRequiredPublicEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredPublicEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
