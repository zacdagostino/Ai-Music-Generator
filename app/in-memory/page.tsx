import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function InMemoryPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Collection</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-800">In Memory</h1>
          <p className="mt-5 text-stone-600">
            A guided path for grief, gratitude, and remembrance. One story. One composition. Held with care.
          </p>
        </div>
        <Card>
          <h2 className="font-serif text-3xl">Offerings</h2>
          <ul className="mt-4 space-y-3 text-sm text-stone-600">
            <li>Sacred Composition - $169</li>
            <li>Visual Tribute - $219</li>
            <li>Legacy Collection - $289</li>
          </ul>
          <Link
            href="/begin/in-memory"
            className="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold !text-white visited:!text-white"
          >
            Begin the ritual
          </Link>
        </Card>
      </div>
    </SiteShell>
  );
}
