import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { updateOrderSchema } from "@/lib/schemas";
import { getShippingStatusForDetails, requiresPhysicalFulfillment } from "@/lib/services/fulfillment";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const physicalRequired = requiresPhysicalFulfillment(parsed.data.tier, parsed.data.addOns);
  const shippingStatus = getShippingStatusForDetails(
    physicalRequired,
    parsed.data.recipientName,
    parsed.data.shippingAddress,
  );

  const order = await prisma.order.update({
    where: { id },
    data: {
      tier: parsed.data.tier,
      addOnsJson: parsed.data.addOns,
      physicalRequired,
      recipientName: parsed.data.recipientName,
      shippingAddressJson: parsed.data.shippingAddress,
      shippingStatus,
    },
  });

  return NextResponse.json(order);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      payment: true,
      attempts: true,
      assets: true,
      generationJob: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
