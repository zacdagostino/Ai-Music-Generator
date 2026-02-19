"use client";

import Link from "next/link";

import { HomeFloatingIslandCanvas } from "@/components/atmosphere/home-floating-island-canvas";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function HomePage() {
  const grainIntensity = 0.14;
  const grainSize = 2.5;
  const grainOpacity = 0.5;
  const principles = [
    {
      title: "Rooted in your story",
      body: "You share voice notes, names, and moments. We shape those details into lyrics and arrangement direction.",
    },
    {
      title: "Human-led curation",
      body: "Every piece is reviewed and refined by hand so the final song feels personal, not mass-produced.",
    },
    {
      title: "Made to keep and share",
      body: "Receive the mastered track, cover art, and a private memory page for family and close friends.",
    },
  ];
  const flow = [
    {
      step: "01",
      title: "Begin the ritual",
      body: "Answer a gentle guided interview about your person, your relationship, and the feeling you want to carry.",
    },
    {
      step: "02",
      title: "We compose",
      body: "Our studio crafts melody, lyric direction, and production with your story as the central thread.",
    },
    {
      step: "03",
      title: "Receive and revisit",
      body: "Get your finished song and return anytime to listen, share privately, and keep the memory alive.",
    },
  ];

  return (
    <SiteShell>
      <HomeFloatingIslandCanvas grainIntensity={grainIntensity} grainOpacity={grainOpacity} grainSize={grainSize} />
      <section className="mx-auto grid max-w-5xl gap-10 pt-6 md:pt-14">
        <div className="text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-stone-500">Boutique Tribute Studio</p>
          <h1 className="font-serif text-5xl leading-[1.05] text-stone-900 md:text-7xl">
            Keep Their Presence
            <br />
            Held in Song
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-stone-700 md:text-lg">
            Personal compositions crafted from memory and love. A calm, guided process that transforms your story into
            a track you can return to for years.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/begin/in-memory"
              className="rounded-full bg-stone-900 px-7 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-stone-800"
            >
              Start In Memory
            </Link>
            <Link
              href="/in-love"
              className="rounded-full border border-stone-300 bg-white/75 px-7 py-3 text-sm font-medium text-stone-700 backdrop-blur transition hover:bg-white"
            >
              Explore In Love
            </Link>
            <Link
              href="/in-memory"
              className="rounded-full border border-stone-300/80 px-7 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-900/5"
            >
              Browse Collection
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <Card key={item.title} className="h-full bg-white/65 p-6 md:p-7">
              <h2 className="font-serif text-2xl text-stone-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-700">{item.body}</p>
            </Card>
          ))}
        </div>

        <Card className="bg-[linear-gradient(155deg,rgba(255,255,255,0.85),rgba(245,238,231,0.88))]">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">How it works</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-stone-900 md:text-5xl">
                A deliberate process, not an instant prompt.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-700 md:text-base">
                The result matters because the process matters. We designed each step to be gentle, clear, and deeply
                personal for people navigating grief and remembrance.
              </p>
              <Link
                href="/orders"
                className="mt-7 inline-flex rounded-full border border-stone-400/60 px-6 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-900/5"
              >
                Track an existing order
              </Link>
            </div>
            <ol className="space-y-4">
              {flow.map((item) => (
                <li key={item.step} className="rounded-2xl border border-stone-300/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold tracking-[0.24em] text-stone-500">{item.step}</p>
                  <h3 className="mt-2 font-serif text-2xl text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </Card>

        <Card className="mx-auto w-full max-w-3xl bg-white/72 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Ready when you are</p>
          <h2 className="mt-3 font-serif text-4xl text-stone-900 md:text-5xl">Begin your tribute today</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-stone-700 md:text-base">
            Start with the In Memory ritual and shape a composition that honors one life with intention.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/begin/in-memory"
              className="rounded-full bg-stone-900 px-7 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-stone-800"
            >
              Begin ritual
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-stone-300 px-7 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-900/5"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}
