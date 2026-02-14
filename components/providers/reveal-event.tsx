"use client";

import { useEffect } from "react";

export function RevealEvent({ orderId }: { orderId: string }) {
  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "reveal_viewed", payload: { orderId } }),
    });
  }, [orderId]);

  return null;
}
