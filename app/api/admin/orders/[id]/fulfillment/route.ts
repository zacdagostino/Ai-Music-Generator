import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminFulfillmentUpdateSchema } from "@/lib/schemas";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = adminFulfillmentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;

  const order = await prisma.order.update({
    where: { id },
    data: {
      shippingStatus: parsed.data.shippingStatus,
      trackingNumber: parsed.data.trackingNumber || null,
      fulfillmentNotes: parsed.data.fulfillmentNotes || null,
      fulfilledAt: parsed.data.shippingStatus === "DELIVERED" ? new Date() : null,
    },
  });

  return NextResponse.json(order);
}
