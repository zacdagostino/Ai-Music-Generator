"use client";

import { useEffect, useState } from "react";

export function CandleToggle({ slug }: { slug: string }) {
  const [lit, setLit] = useState(false);

  useEffect(() => {
    setLit(localStorage.getItem(`candle-${slug}`) === "lit");
  }, [slug]);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !lit;
        setLit(next);
        localStorage.setItem(`candle-${slug}`, next ? "lit" : "dim");
      }}
      className="rounded-full border border-stone-300 px-4 py-2 text-xs uppercase tracking-[0.14em] text-stone-600 transition hover:bg-white/60"
    >
      {lit ? "Candle lit" : "Light a candle"}
    </button>
  );
}
