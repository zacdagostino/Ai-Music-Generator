"use client";

import { signOut, useSession } from "next-auth/react";

import { useMotionPrefs } from "@/components/providers/motion-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function AccountPage() {
  const { data } = useSession();
  const { reduced, setReduced } = useMotionPrefs();

  return (
    <SiteShell>
      <Card className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-serif text-4xl text-stone-800">Account</h1>
        <p className="text-sm text-stone-600">Signed in as: {data?.user?.email ?? "Guest"}</p>
        <label className="flex items-center gap-3 text-sm text-stone-700">
          <input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} />
          Reduce motion
        </label>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Vault subscription</p>
          <p className="mt-2 text-sm text-stone-600">$12/month or $99/year. Coming soon.</p>
        </div>
        <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
      </Card>
    </SiteShell>
  );
}
