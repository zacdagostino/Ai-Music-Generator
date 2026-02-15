"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsProvider() {
  const pathname = usePathname();

  const collection =
    pathname.startsWith("/in-memory") || pathname.startsWith("/begin/in-memory")
      ? "IN_MEMORY"
      : pathname.startsWith("/in-love") || pathname.startsWith("/begin/in-love")
        ? "IN_LOVE"
        : undefined;

  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", payload: { pathname, collection } }),
    });
  }, [collection, pathname]);

  return null;
}
