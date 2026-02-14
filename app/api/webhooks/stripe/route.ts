import { OrderStatus, PaymentStatus } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { trackServerEvent } from "@/lib/analytics/events";
import { prisma } from "@/lib/prisma";
import { runGenerationPipeline } from "@/lib/services/generation";
import { getStripeOrThrow } from "@/lib/services/stripe";

export async function POST(req: Request) {
  const stripe = getStripeOrThrow();
  const rawBody = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook configuration missing" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: `Invalid signature: ${String(error)}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.PAID } });
      await prisma.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          status: PaymentStatus.SUCCEEDED,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
        },
        update: {
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          status: PaymentStatus.SUCCEEDED,
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
        },
      });

      await trackServerEvent("purchase", {
        orderId,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
      });

      runGenerationPipeline(orderId).catch((error: unknown) => {
        console.error("webhook generation failed", orderId, error);
      });
    }
  }

  return NextResponse.json({ received: true });
}
