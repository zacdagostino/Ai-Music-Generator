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

  return NextResponse.json({
    status: order.status,
    generationStatus: order.generationJob?.status,
    ready: order.status === "READY",
    selectedAttempt: order.attempts[0] ?? null,
  });
}
