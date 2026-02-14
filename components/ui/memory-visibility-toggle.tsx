"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function MemoryVisibilityToggle({ slug, token, defaultPublic }: { slug: string; token: string; defaultPublic: boolean }) {
  const [isPublic, setIsPublic] = useState(defaultPublic);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const response = await fetch(`/api/memory/${slug}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !isPublic, token }),
    });

    if (response.ok) setIsPublic((v) => !v);
    setLoading(false);
  };

  return (
    <Button className="bg-white text-stone-700" onClick={toggle} disabled={loading || !token}>
      {isPublic ? "Set to private" : "Make public"}
    </Button>
  );
}
