import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      generationJob: true,
      attempts: {
        where: { selected: true },
        take: 1,
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const failureMessage =
    order.status === "FAILED"
      ? "We hit a delay while composing. We're preparing a gentle retry and can support you directly if needed."
      : null;

  return NextResponse.json({
    status: order.status,
    collection: order.eventType,
    tier: order.tier,
    generationStatus: order.generationJob?.status,
    ready: order.status === "READY",
    selectedAttempt: order.attempts[0] ?? null,
    failureMessage,
    physicalRequired: order.physicalRequired,
    shippingStatus: order.shippingStatus,
    trackingNumber: order.trackingNumber,
  });
}
