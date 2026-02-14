import { getServerSession } from "next-auth";

import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { RegenerateButton } from "./regenerate-button";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return (
      <SiteShell>
        <Card className="mx-auto max-w-2xl">Admin access only.</Card>
      </SiteShell>
    );
  }

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
    return (
      <SiteShell>
        <Card className="mx-auto max-w-2xl">Order not found.</Card>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Card className="mx-auto max-w-5xl space-y-6">
        <h1 className="font-serif text-4xl text-stone-800">Order {order.id}</h1>
        <p className="text-sm text-stone-600">Status: {order.status}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <pre className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-xs text-stone-700">
            {JSON.stringify(order.answersJson, null, 2)}
          </pre>
          <pre className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-xs text-stone-700">
            {JSON.stringify(order.promptJson, null, 2)}
          </pre>
        </div>
        <RegenerateButton id={order.id} />
        <a
          href={`https://dashboard.stripe.com/payments/${order.payment?.stripePaymentIntentId ?? ""}`}
          className="inline-block text-sm underline"
          target="_blank"
          rel="noreferrer"
        >
          Open Stripe payment
        </a>
      </Card>
    </SiteShell>
  );
}
