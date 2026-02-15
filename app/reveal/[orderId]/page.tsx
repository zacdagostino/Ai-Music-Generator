import Link from "next/link";

import { RevealEvent } from "@/components/providers/reveal-event";
import { PostPurchaseFeedback } from "@/components/reveal/post-purchase-feedback";
import { CandleToggle } from "@/components/ui/candle-toggle";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RevealPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      attempts: { where: { selected: true }, take: 1 },
      assets: true,
    },
  });

  if (!order) {
    return (
      <SiteShell>
        <Card className="mx-auto max-w-2xl">Order not found.</Card>
      </SiteShell>
    );
  }

  const selected = order.attempts[0];
  const answers = order.answersJson as Record<string, string> | null;
  const videoAsset = order.assets.find((asset) => asset.type === "VIDEO");

  return (
    <SiteShell>
      <RevealEvent orderId={order.id} collection={order.eventType} tier={order.tier} />
      <Card className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Reveal</p>
            <h1 className="mt-2 font-serif text-4xl text-stone-800">
              For {answers?.honoreeName ?? (order.eventType === "IN_LOVE" ? "your person" : "your loved one")}
            </h1>
          </div>
          <CandleToggle slug={order.slug} />
        </div>

        {selected?.resultUrl ? (
          <audio controls className="w-full">
            <source src={selected.resultUrl} />
          </audio>
        ) : (
          <p className="text-sm text-stone-600">Audio is still processing.</p>
        )}

        <div className="rounded-2xl border border-stone-200 bg-white/60 p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-stone-500">Lyric excerpt</p>
          <p className="whitespace-pre-wrap text-sm text-stone-700">{selected?.lyrics ?? "Lyrics pending"}</p>
        </div>

        {videoAsset && (
          <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-stone-500">Visual Tribute</p>
            <a href={videoAsset.url} className="underline">
              Download slideshow render
            </a>
          </div>
        )}

        {order.physicalRequired && (
          <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm text-stone-700">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-stone-500">Keepsake fulfillment</p>
            <p>Status: {order.shippingStatus}</p>
            {order.trackingNumber ? <p className="mt-1">Tracking: {order.trackingNumber}</p> : null}
            <p className="mt-2 text-xs text-stone-500">
              Production typically takes 2-4 business days after digital reveal, then US shipping in 3-7 business days.
            </p>
          </div>
        )}

        <PostPurchaseFeedback
          orderId={order.id}
          defaultConsent={order.testimonialConsent}
          defaultRating={order.feedbackRating}
          defaultText={order.feedbackText}
        />

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={`/memory/${order.slug}?token=${order.shareToken}`} className="underline">
            Open memory page
          </Link>
          <Link href={`/compose/${order.id}`} className="underline">
            Return to composing screen
          </Link>
        </div>
      </Card>
    </SiteShell>
  );
}
