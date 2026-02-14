import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isPublic, token } = await req.json();

  const order = await prisma.order.findUnique({ where: { slug } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (token !== order.shareToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const updated = await prisma.order.update({ where: { slug }, data: { isPublic: Boolean(isPublic) } });
  return NextResponse.json({ slug: updated.slug, isPublic: updated.isPublic });
}
