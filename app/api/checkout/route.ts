import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { computeOrderTotal } from "@/lib/services/pricing";
import { getStripeOrThrow } from "@/lib/services/stripe";

export async function POST(req: Request) {
  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.tier) return NextResponse.json({ error: "Order missing tier" }, { status: 400 });

  const addOns = (order.addOnsJson as string[] | null) ?? [];
  const totals = computeOrderTotal(order.tier, addOns);
  const stripe = getStripeOrThrow();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${process.env.APP_URL}/compose/${order.id}`,
    cancel_url: `${process.env.APP_URL}/checkout?orderId=${order.id}`,
    customer_email: order.email,
    metadata: { orderId: order.id },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: "Held in Song composition",
            description: `Tier: ${order.tier}`,
          },
          unit_amount: totals.total,
        },
      },
    ],
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      amount: totals.total,
      status: PaymentStatus.PENDING,
      stripeCheckoutSessionId: session.id,
    },
    update: {
      amount: totals.total,
      stripeCheckoutSessionId: session.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
