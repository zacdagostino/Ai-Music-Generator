"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ComposingScreen } from "@/components/compose/composing-screen";
import { SiteShell } from "@/components/ui/site-shell";

export default function ComposePage() {
  const routeParams = useParams<{ orderId: string }>();
  const router = useRouter();
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [fulfillmentCopy, setFulfillmentCopy] = useState<string | null>(null);

  useEffect(() => {
    const orderId = routeParams.orderId;
    if (!orderId) return;
    let timeout: ReturnType<typeof setTimeout>;

    void fetch(`/api/orders/${orderId}/generate`, { method: "POST" });

    const poll = async () => {
      const response = await fetch(`/api/orders/${orderId}/status`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.ready) {
        router.push(`/reveal/${orderId}`);
        return;
      }

      setFailureMessage(data.failureMessage ?? null);
      if (data.physicalRequired) {
        setFulfillmentCopy(
          "Digital delivery first, then physical keepsake production in 2-4 business days with US shipping in 3-7 business days.",
        );
      }

      if (data.status === "FAILED") return;
      timeout = setTimeout(poll, 5000);
    };

    poll();
    return () => clearTimeout(timeout);
  }, [routeParams.orderId, router]);

  return (
    <SiteShell>
      <ComposingScreen subtitle={failureMessage ?? fulfillmentCopy ?? undefined} />
    </SiteShell>
  );
}
