import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const adSpend = Number(url.searchParams.get("adSpend") ?? "0");

  const [payments, memoryBegins, loveBegins, memoryPurchases, lovePurchases, paidOrders] =
    await Promise.all([
      prisma.payment.findMany({ where: { status: "SUCCEEDED" } }),
      prisma.analyticsEvent.count({ where: { event: "begin_ritual", collection: "IN_MEMORY" } }),
      prisma.analyticsEvent.count({ where: { event: "begin_ritual", collection: "IN_LOVE" } }),
      prisma.analyticsEvent.count({ where: { event: "purchase", collection: "IN_MEMORY" } }),
      prisma.analyticsEvent.count({ where: { event: "purchase", collection: "IN_LOVE" } }),
      prisma.order.findMany({
        where: { status: { in: ["PAID", "COMPOSING", "READY", "REFUNDED"] } },
        select: { addOnsJson: true },
      }),
    ]);

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPurchases = memoryPurchases + lovePurchases;

  const withAddOns = paidOrders.filter((order) => Array.isArray(order.addOnsJson) && order.addOnsJson.length > 0).length;

  return NextResponse.json({
    memoryCvr: memoryBegins ? memoryPurchases / memoryBegins : 0,
    loveCvr: loveBegins ? lovePurchases / loveBegins : 0,
    aovCents: payments.length ? totalRevenue / payments.length : 0,
    addOnAttachRate: paidOrders.length ? withAddOns / paidOrders.length : 0,
    cacProxy: totalPurchases ? adSpend / totalPurchases : 0,
  });
}
