"use client";

import { motion } from "framer-motion";

import { COMPOSING_ESTIMATE } from "@/lib/constants";

export function ComposingScreen({ subtitle }: { subtitle?: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        className="h-24 w-24 rounded-full border border-stone-300 bg-white/40 shadow-[0_20px_60px_-30px_rgba(70,55,45,0.35)]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <h1 className="font-serif text-4xl text-stone-800">We&apos;re gently composing...</h1>
      <p className="max-w-xl text-sm leading-relaxed text-stone-600">
        {subtitle ??
          "Your story is being translated into a calm musical tribute with care. This is intentionally paced to feel ceremonial rather than instant."}
      </p>
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{COMPOSING_ESTIMATE}</p>
    </div>
  );
}
