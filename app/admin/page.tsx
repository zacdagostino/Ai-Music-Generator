import Link from "next/link";
import { getServerSession } from "next-auth";

import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return (
      <SiteShell>
        <Card className="mx-auto max-w-2xl">Admin access only.</Card>
      </SiteShell>
    );
  }

  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <SiteShell>
      <Card className="mx-auto max-w-5xl">
        <h1 className="font-serif text-4xl text-stone-800">Admin Orders</h1>
        <div className="mt-6 space-y-3 text-sm">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-2xl border border-stone-200 p-4">
              <div>
                <p className="font-medium text-stone-800">{order.email}</p>
                <p className="text-stone-500">{order.status}</p>
              </div>
              <Link href={`/admin/orders/${order.id}`} className="underline">
                Review
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </SiteShell>
  );
}
