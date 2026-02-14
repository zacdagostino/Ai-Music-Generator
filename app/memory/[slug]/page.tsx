import { notFound } from "next/navigation";

import { CandleToggle } from "@/components/ui/candle-toggle";
import { Card } from "@/components/ui/card";
import { MemoryVisibilityToggle } from "@/components/ui/memory-visibility-toggle";
import { SiteShell } from "@/components/ui/site-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MemoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { slug },
    include: {
      attempts: { where: { selected: true }, take: 1 },
      assets: true,
    },
  });

  if (!order) return notFound();

  const canView = order.isPublic || token === order.shareToken;
  if (!canView) {
    return (
      <SiteShell>
        <Card className="mx-auto max-w-2xl text-center text-sm text-stone-600">
          This memory page is private. Use the share link provided to the purchaser.
        </Card>
      </SiteShell>
    );
  }

  const answers = order.answersJson as Record<string, string> | null;
  const selected = order.attempts[0];

  return (
    <SiteShell>
      <Card className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-4xl text-stone-800">{answers?.honoreeName}</h1>
          <CandleToggle slug={slug} />
        </div>
        {token && <MemoryVisibilityToggle slug={slug} token={token} defaultPublic={order.isPublic} />}
        {selected?.resultUrl && (
          <audio controls className="w-full">
            <source src={selected.resultUrl} />
          </audio>
        )}
        <p className="whitespace-pre-wrap text-sm text-stone-700">{selected?.lyrics ?? "Lyrics pending"}</p>
      </Card>
    </SiteShell>
  );
}
