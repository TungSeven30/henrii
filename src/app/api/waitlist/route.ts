import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type WaitlistBody = {
  email?: string;
  locale?: string;
  source?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as WaitlistBody | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const locale = body?.locale === "vi" ? "vi" : "en";
  const source = body?.source?.trim() || "landing";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Missing admin configuration" }, { status: 503 });
  }

  const { error } = await admin.from("waitlist_signups").upsert(
    {
      email,
      locale,
      source,
    },
    {
      onConflict: "email",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
