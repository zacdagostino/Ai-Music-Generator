import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { runGenerationPipeline } from "@/lib/services/generation";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.tier) return NextResponse.json({ error: "Order tier is not selected" }, { status: 400 });
  if (!["PAID", "COMPOSING", "FAILED"].includes(order.status)) {
    return NextResponse.json({ error: "Order is not ready for generation yet" }, { status: 400 });
  }

  runGenerationPipeline(id).catch((error: unknown) => {
    console.error("generation failed", id, error);
  });

  return NextResponse.json({ started: true });
}
