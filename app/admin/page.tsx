import Link from "next/link";
import { getServerSession } from "next-auth";

import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";
import { authOptions } from "@/lib/auth";
import { LAUNCH_THRESHOLDS, STOP_GO_RULES, WEEKLY_REVIEW_CADENCE } from "@/lib/launch/thresholds";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ adSpend?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return (
      <SiteShell>
        <Card className="mx-auto max-w-2xl">Admin access only.</Card>
      </SiteShell>
    );
  }

  const params = await searchParams;
  const adSpend = Number(params.adSpend ?? "0");

  const [
    orders,
    paidPayments,
    memoryBegins,
    loveBegins,
    memoryPurchases,
    lovePurchases,
    paidOrders,
  ] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.payment.findMany({ where: { status: "SUCCEEDED" } }),
    prisma.analyticsEvent.count({ where: { event: "begin_ritual", collection: "IN_MEMORY" } }),
    prisma.analyticsEvent.count({ where: { event: "begin_ritual", collection: "IN_LOVE" } }),
    prisma.analyticsEvent.count({ where: { event: "purchase", collection: "IN_MEMORY" } }),
    prisma.analyticsEvent.count({ where: { event: "purchase", collection: "IN_LOVE" } }),
    prisma.order.findMany({
      where: {
        status: { in: ["PAID", "COMPOSING", "READY", "REFUNDED"] },
      },
      select: { addOnsJson: true },
    }),
  ]);

  const paidOrdersWithAddOns = paidOrders.filter((order) => {
    if (!Array.isArray(order.addOnsJson)) return false;
    return order.addOnsJson.length > 0;
  }).length;

  const paidOrderCount = paidOrders.length;

  const totalRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const aov = paidPayments.length > 0 ? totalRevenue / paidPayments.length : 0;
  const attachRate = paidOrderCount > 0 ? paidOrdersWithAddOns / paidOrderCount : 0;
  const memoryCvr = memoryBegins > 0 ? memoryPurchases / memoryBegins : 0;
  const loveCvr = loveBegins > 0 ? lovePurchases / loveBegins : 0;
  const totalPurchases = memoryPurchases + lovePurchases;
  const cacProxy = totalPurchases > 0 ? adSpend / totalPurchases : 0;

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <h1 className="font-serif text-4xl text-stone-800">Launch Dashboard</h1>
          <p className="mt-2 text-sm text-stone-600">First 10 sales focus with premium brand constraints.</p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Collection CVR</p>
              <p className="mt-2">In Memory: {percent(memoryCvr)}</p>
              <p>In Love: {percent(loveCvr)}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Revenue Quality</p>
              <p className="mt-2">AOV: ${(aov / 100).toFixed(2)}</p>
              <p>Add-on attach rate: {percent(attachRate)}</p>
              <p>CAC proxy: ${cacProxy.toFixed(2)} (ad spend input: ${adSpend.toFixed(2)})</p>
            </div>
          </div>

          <form className="mt-4 flex items-center gap-3" action="/admin">
            <input
              name="adSpend"
              defaultValue={String(adSpend || "")}
              placeholder="Enter total ad spend"
              className="rounded-xl border border-stone-200 bg-white/70 px-3 py-2 text-sm"
            />
            <button className="rounded-full border border-stone-300 bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Update CAC proxy
            </button>
          </form>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Stop/Go Rules</p>
              <ul className="mt-2 space-y-1 text-stone-700">
                {STOP_GO_RULES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Weekly Review Cadence</p>
              <ul className="mt-2 space-y-1 text-stone-700">
                {WEEKLY_REVIEW_CADENCE.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-4 text-xs text-stone-500">
            Targets: {LAUNCH_THRESHOLDS.targetOrdersIn30Days} orders in 30 days, AOV ${(
              LAUNCH_THRESHOLDS.targetAovCents / 100
            ).toFixed(0)}+, physical attach {percent(LAUNCH_THRESHOLDS.targetPhysicalAttachRate)}.
          </p>
        </Card>

        <Card>
          <h2 className="font-serif text-3xl text-stone-800">Admin Orders</h2>
          <div className="mt-6 space-y-3 text-sm">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl border border-stone-200 p-4">
                <div>
                  <p className="font-medium text-stone-800">{order.email}</p>
                  <p className="text-stone-500">
                    {order.eventType} · {order.status} · {order.shippingStatus}
                  </p>
                </div>
                <Link href={`/admin/orders/${order.id}`} className="underline">
                  Review
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SiteShell>
  );
}
