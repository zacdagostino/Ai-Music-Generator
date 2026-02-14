import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];
  let dbUnavailable = false;

  try {
    orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 25 });
  } catch {
    dbUnavailable = true;
  }

  return (
    <SiteShell>
      <Card className="mx-auto max-w-4xl">
        <h1 className="font-serif text-4xl text-stone-800">Orders</h1>
        {dbUnavailable ? (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-stone-600">We couldn&apos;t connect to the database right now.</p>
            <p className="text-xs text-stone-500">
              Check <code>DATABASE_URL</code> in <code>.env.local</code> and restart the dev server.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl border border-stone-200 p-4 text-sm">
                <div>
                  <p className="font-medium text-stone-800">{order.email}</p>
                  <p className="text-stone-500">{order.status}</p>
                </div>
                <Link href={`/reveal/${order.id}`} className="text-stone-700 underline">
                  Open
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </SiteShell>
  );
}
