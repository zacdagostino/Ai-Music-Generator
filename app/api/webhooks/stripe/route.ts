import { OrderStatus, PaymentStatus } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { trackServerEvent } from "@/lib/analytics/events";
import { prisma } from "@/lib/prisma";
import { getPostPaymentShippingStatus } from "@/lib/services/fulfillment";
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
      const txResult = await prisma.$transaction(async (tx) => {
        const existingPayment = await tx.payment.findUnique({ where: { orderId } });
        if (
          existingPayment?.status === PaymentStatus.SUCCEEDED ||
          existingPayment?.lastWebhookEventId === event.id
        ) {
          return { alreadyProcessed: true, order: await tx.order.findUnique({ where: { id: orderId } }) };
        }

        const currentOrder = await tx.order.findUnique({ where: { id: orderId } });
        if (!currentOrder) {
          return { alreadyProcessed: true, order: null };
        }

        const order = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.PAID,
            shippingStatus: getPostPaymentShippingStatus(currentOrder.shippingStatus, currentOrder.physicalRequired),
          },
        });

        await tx.payment.upsert({
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
            eventType: order.eventType,
            tier: order.tier,
            lastWebhookEventId: event.id,
            metadataJson: session.metadata ?? undefined,
          },
          update: {
            amount: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            status: PaymentStatus.SUCCEEDED,
            stripePaymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
            eventType: order.eventType,
            tier: order.tier,
            lastWebhookEventId: event.id,
            metadataJson: session.metadata ?? undefined,
          },
        });

        return { alreadyProcessed: false, order };
      });

      if (!txResult.alreadyProcessed && txResult.order) {
        await trackServerEvent("purchase", {
          orderId,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          collection: txResult.order.eventType,
          tier: txResult.order.tier ?? undefined,
        });

        runGenerationPipeline(orderId).catch((error: unknown) => {
          console.error("webhook generation failed", orderId, error);
        });
      } else {
        console.log("duplicate checkout webhook ignored", { eventId: event.id, orderId });
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await prisma.payment.updateMany({
        where: { orderId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED },
      });
    }
  }

  return NextResponse.json({ received: true });
}
