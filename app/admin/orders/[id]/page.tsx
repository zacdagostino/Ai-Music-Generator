import { getServerSession } from "next-auth";

import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { RegenerateButton } from "./regenerate-button";
import { FulfillmentControls } from "./fulfillment-controls";

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
        <p className="text-sm text-stone-600">
          Collection: {order.eventType} · Tier: {order.tier ?? "N/A"} · Status: {order.status}
        </p>
        <p className="text-sm text-stone-600">
          Fulfillment: {order.shippingStatus}
          {order.trackingNumber ? ` · Tracking ${order.trackingNumber}` : ""}
        </p>
        {order.physicalRequired && (
          <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm text-stone-700">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Shipping details</p>
            <p className="mt-2">Recipient: {order.recipientName ?? "Missing"}</p>
            <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(order.shippingAddressJson, null, 2)}</pre>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <pre className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-xs text-stone-700">
            {JSON.stringify(order.answersJson, null, 2)}
          </pre>
          <pre className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-xs text-stone-700">
            {JSON.stringify(order.promptJson, null, 2)}
          </pre>
        </div>
        <FulfillmentControls
          orderId={order.id}
          currentStatus={order.shippingStatus}
          currentTracking={order.trackingNumber}
          currentNotes={order.fulfillmentNotes}
        />
        <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm text-stone-700">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Ops resources</p>
          <p className="mt-2">
            See <code>docs/launch/fulfillment-sop.md</code> and <code>docs/launch/support-templates.md</code>.
          </p>
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
