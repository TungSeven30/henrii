import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SubscriptionRecord = {
  user_id: string;
  plan: "free" | "premium";
  status: "active" | "canceled" | "past_due" | "incomplete";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
};

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionRecord["status"] {
  if (status === "active" || status === "trialing") {
    return "active";
  }

  if (status === "past_due" || status === "unpaid") {
    return "past_due";
  }

  if (status === "incomplete" || status === "incomplete_expired") {
    return "incomplete";
  }

  return "canceled";
}

async function upsertSubscription(record: SubscriptionRecord) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  await admin.from("subscriptions").upsert(record, {
    onConflict: "user_id",
    ignoreDuplicates: false,
  });
}

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId =
      (session.client_reference_id as string | null) ??
      (session.metadata?.user_id as string | undefined) ??
      null;

    if (!userId) {
      return NextResponse.json({ ok: true, ignored: "missing_user_id" });
    }

    await upsertSubscription({
      user_id: userId,
      plan: "premium",
      status: "active",
      stripe_customer_id:
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
      stripe_subscription_id:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null,
      current_period_start: null,
      current_period_end: null,
    });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = (subscription.metadata?.user_id as string | undefined) ?? null;
    if (!userId) {
      return NextResponse.json({ ok: true, ignored: "missing_user_id_metadata" });
    }

    await upsertSubscription({
      user_id: userId,
      plan: event.type === "customer.subscription.deleted" ? "free" : "premium",
      status:
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : mapStripeStatus(subscription.status),
      stripe_customer_id:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      current_period_start: null,
      current_period_end: null,
    });
  }

  return NextResponse.json({ received: true });
}
