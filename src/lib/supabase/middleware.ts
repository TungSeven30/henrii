import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

type AuthResult = {
  user: { id: string } | null;
  supabase: ReturnType<typeof createServerClient<Database>> | null;
  response: NextResponse;
};

export async function createMiddlewareClient(request: NextRequest): Promise<AuthResult> {
  const response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, supabase: null, response };
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user: user
      ? {
          id: user.id,
        }
    : null,
    supabase,
    response,
  };
}

export async function updateSession(request: NextRequest) {
  return createMiddlewareClient(request);
}
