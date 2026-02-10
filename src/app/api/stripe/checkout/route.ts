import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSiteUrl(request: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const premiumPriceId = process.env.STRIPE_PRICE_PREMIUM_MONTHLY;

  if (!stripeSecretKey || !premiumPriceId) {
    return NextResponse.json(
      { error: "Stripe checkout is not configured." },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_baby_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active_baby_id) {
    return NextResponse.json({ error: "No active baby selected" }, { status: 409 });
  }

  const { data: baby } = await supabase
    .from("babies")
    .select("owner_id")
    .eq("id", profile.active_baby_id)
    .maybeSingle();

  if (!baby || baby.owner_id !== user.id) {
    return NextResponse.json(
      { error: "Only the baby owner can manage billing." },
      { status: 403 },
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const siteUrl = getSiteUrl(request);
  const locale = new URL(request.url).searchParams.get("locale") ?? "en";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    line_items: [
      {
        price: premiumPriceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        user_id: user.id,
      },
    },
    success_url: `${siteUrl}/${locale}/settings?billing=success`,
    cancel_url: `${siteUrl}/${locale}/settings?billing=cancelled`,
    metadata: {
      user_id: user.id,
      locale,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Unable to create checkout session." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: session.url });
}
