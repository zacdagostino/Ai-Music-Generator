import Link from "next/link";

import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-4xl gap-8 pt-8 md:pt-16">
        <div className="text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-stone-500">Boutique Tribute Studio</p>
          <h1 className="font-serif text-5xl leading-tight text-stone-800 md:text-6xl">
            Held in Song
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-stone-600">
            Personal compositions crafted from memory and love. A calm, guided ritual that turns your story into a
            musical tribute.
          </p>
        </div>

        <Card className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl text-stone-800">In Memory</h2>
          <p className="mt-3 text-sm text-stone-600">
            Our first collection. Begin with a gentle interview and we&apos;ll compose with care.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/in-memory"
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-stone-800"
            >
              Explore collection
            </Link>
            <Link
              href="/begin/in-memory"
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-white/70"
            >
              Begin ritual
            </Link>
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}
