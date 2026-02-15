"use client";

import { useEffect } from "react";

export function RevealEvent({
  orderId,
  collection,
  tier,
}: {
  orderId: string;
  collection: "IN_MEMORY" | "IN_LOVE";
  tier?: "SACRED_COMPOSITION" | "VISUAL_TRIBUTE" | "LEGACY_COLLECTION" | null;
}) {
  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "reveal_viewed", payload: { orderId, collection, tier } }),
    });
  }, [collection, orderId, tier]);

  return null;
}
