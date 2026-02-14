"use client";

import { Button } from "@/components/ui/button";

export function RegenerateButton({ id }: { id: string }) {
  return (
    <Button
      onClick={async () => {
        await fetch(`/api/admin/orders/${id}/regenerate`, { method: "POST" });
        window.location.reload();
      }}
    >
      Regenerate
    </Button>
  );
}
