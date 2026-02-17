"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";

import { SiteShell } from "@/components/ui/site-shell";
import { useMotionPrefs } from "@/components/providers/motion-provider";
import { WebglHeroScene } from "@/components/home/webgl-hero-scene";

const COLLECTIONS = [
  {
    name: "In Memory",
    eyebrow: "Live Collection",
    description:
      "A gentle tribute for grief, gratitude, and remembrance. Compose from precious details that deserve to be carried forward.",
    exploreHref: "/in-memory",
    beginHref: "/begin/in-memory",
    processHref: "/begin/in-memory",
    accentOverlay: "linear-gradient(135deg, rgba(248, 213, 196, 0.64), rgba(248, 236, 214, 0.42))",
  },
  {
    name: "In Love",
    eyebrow: "Live Collection",
    description:
      "A romantic composition ritual for anniversaries, vows, and shared chapters. Elegant, heartfelt, and deeply personal.",
    exploreHref: "/in-love",
    beginHref: "/begin/in-love",
    processHref: "/begin/in-love",
    accentOverlay: "linear-gradient(135deg, rgba(208, 229, 215, 0.62), rgba(247, 221, 214, 0.42))",
  },
] as const;

const TIERS = [
  {
    name: "Sacred Composition",
    price: "$169",
    detail: "Guided ritual, one composed song, lyric page, private reveal.",
  },
  {
    name: "Visual Tribute",
    price: "$219",
    detail: "Everything above plus cinematic photo tribute video.",
  },
  {
    name: "Legacy Collection",
    price: "$289",
    detail: "Adds keepsake card, linen lyric print placeholder, and permanent memory page.",
  },
] as const;

const SECTION_LINKS = [
  { href: "#collections", label: "Collections" },
  { href: "#ceremony", label: "Ceremony" },
  { href: "#pricing", label: "Pricing" },
  { href: "#care", label: "Care" },
  { href: "#begin", label: "Begin" },
] as const;

function MotionSafe({
  children,
  delay = 0,
  reduced,
}: {
  children: React.ReactNode;
  delay?: number;
  reduced: boolean;
}) {
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 32, filter: "blur(10px)" }}
      animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function HomePageExperience() {
  const { reduced } = useMotionPrefs();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  const { scrollYProgress } = useScroll();
  useMotionValueEvent(scrollYProgress, "change", (value) => setScrollProgress(value));

  const driftY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const collectionDrift = useTransform(scrollYProgress, [0.08, 0.45], [30, -24]);
  const ceremonyDrift = useTransform(scrollYProgress, [0.2, 0.65], [28, -18]);
  const pricingDrift = useTransform(scrollYProgress, [0.35, 0.9], [24, -10]);

  const pointerX = useSpring(pointer.x, { stiffness: 36, damping: 16, mass: 0.9 });
  const pointerY = useSpring(pointer.y, { stiffness: 36, damping: 16, mass: 0.9 });
  const heroX = useTransform(pointerX, [-1, 1], [-16, 16]);
  const heroY = useTransform(pointerY, [-1, 1], [-12, 12]);

  const onPointerMove = useMemo(
    () => (event: React.MouseEvent<HTMLElement>) => {
      if (reduced) return;
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      setPointer({ x: (x - 0.5) * 2, y: (y - 0.5) * -2 });
    },
    [reduced],
  );

  return (
    <div className="relative min-h-screen overflow-hidden" onMouseMove={onPointerMove}>
      <WebglHeroScene pointer={pointer} scrollProgress={scrollProgress} />

      <motion.div
        className="fixed left-0 top-0 z-40 h-[2px] w-full origin-left bg-stone-900/50"
        style={{ scaleX: reduced ? 1 : scrollYProgress }}
      />

      <motion.div
        style={{ y: reduced ? undefined : driftY }}
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_95%_at_10%_0%,rgba(231,199,183,0.35),rgba(242,238,231,0.92)_42%,rgba(197,208,196,0.26)_100%)]"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 home-atmosphere opacity-90" />
      <div className="pointer-events-none absolute inset-0 -z-10 home-vignette" />

      <SiteShell>
        <section className="pt-4 md:pt-10">
          <MotionSafe reduced={reduced}>
            <nav className="mb-5 hidden justify-center gap-2 md:flex">
              {SECTION_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-stone-300/50 bg-white/55 px-3 py-1.5 text-xs font-medium tracking-[0.16em] text-stone-700 transition duration-500 hover:border-stone-500/40 hover:bg-white/80"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </MotionSafe>

          <motion.div
            style={{ x: reduced ? undefined : heroX, y: reduced ? undefined : heroY }}
            className="mx-auto max-w-4xl rounded-[2.2rem] border border-white/35 bg-white/44 px-6 pb-8 pt-10 text-center shadow-[0_30px_90px_rgba(58,50,45,0.17)] backdrop-blur-xl md:px-12 md:pb-12"
          >
            <MotionSafe reduced={reduced}>
              <p className="mb-4 text-xs uppercase tracking-[0.28em] text-stone-500">Held in Song</p>
              <h1 className="font-serif text-5xl leading-[0.95] text-stone-900 md:text-7xl">
                Compositions for moments that shape a lifetime.
              </h1>
            </MotionSafe>

            <MotionSafe reduced={reduced} delay={0.15}>
              <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-stone-700 md:text-lg">
                Spiritual, modern, and deeply human. Begin with a guided ritual, then receive a bespoke composition held
                in sound, lyric, and memory.
              </p>
            </MotionSafe>

            <MotionSafe reduced={reduced} delay={0.28}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/begin/in-memory"
                  className="rounded-full bg-stone-950 px-7 py-3.5 text-sm font-semibold !text-white visited:!text-white transition duration-500 hover:-translate-y-0.5 hover:bg-stone-800"
                >
                  Begin In Memory
                </Link>
                <Link
                  href="/begin/in-love"
                  className="rounded-full border border-stone-400/40 bg-white/65 px-7 py-3.5 text-sm font-semibold text-stone-800 transition duration-500 hover:-translate-y-0.5 hover:bg-white"
                >
                  Begin In Love
                </Link>
                <a
                  href="#collections"
                  className="rounded-full border border-stone-400/35 bg-white/55 px-7 py-3.5 text-sm font-semibold text-stone-700 transition duration-500 hover:-translate-y-0.5 hover:bg-white/85"
                >
                  Explore collections
                </a>
              </div>
            </MotionSafe>
          </motion.div>
        </section>

        <section id="collections" className="mt-16 md:mt-24">
          <motion.div style={{ y: reduced ? undefined : collectionDrift }} className="mb-7">
            <MotionSafe reduced={reduced}>
              <p className="text-center text-xs uppercase tracking-[0.24em] text-stone-500">Choose Your Collection</p>
              <h2 className="mt-3 text-center font-serif text-4xl text-stone-900 md:text-5xl">
                Two paths, one gentle process.
              </h2>
            </MotionSafe>
          </motion.div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {COLLECTIONS.map((collection, index) => (
            <motion.article
              key={collection.name}
              initial={reduced ? undefined : { opacity: 0, y: 22, filter: "blur(8px)" }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
              whileHover={reduced ? undefined : { y: -6, scale: 1.01 }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/62 p-8 shadow-[0_24px_70px_rgba(58,50,45,0.12)] backdrop-blur-xl"
            >
              <div
                className="absolute inset-0 opacity-55 transition duration-700 group-hover:opacity-80"
                style={{ backgroundImage: collection.accentOverlay }}
              />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-600">{collection.eyebrow}</p>
                <h2 className="mt-3 font-serif text-4xl text-stone-900">{collection.name}</h2>
                <p className="mt-4 text-sm leading-relaxed text-stone-700">{collection.description}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={collection.exploreHref}
                    className="rounded-full border border-stone-300/70 bg-white/80 px-5 py-2.5 text-sm font-semibold text-stone-800 transition duration-500 hover:bg-white"
                  >
                    Explore
                  </Link>
                  <Link
                    href={collection.beginHref}
                    className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold !text-white visited:!text-white transition duration-500 hover:bg-stone-800"
                  >
                    Begin ritual
                  </Link>
                  <Link
                    href={collection.processHref}
                    className="rounded-full border border-stone-400/40 bg-transparent px-5 py-2.5 text-sm font-semibold text-stone-700 transition duration-500 hover:bg-white/65"
                  >
                    Enter ceremony
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        <section id="ceremony" className="mt-16 md:mt-24">
          <motion.div
            style={{ y: reduced ? undefined : ceremonyDrift }}
            initial={reduced ? undefined : { opacity: 0, y: 22, filter: "blur(8px)" }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] border border-white/45 bg-white/66 p-7 shadow-[0_24px_70px_rgba(58,50,45,0.12)] backdrop-blur-xl md:p-10"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">The Ceremony</p>
            <h3 className="mt-3 font-serif text-4xl text-stone-900 md:text-5xl">Calm, guided, and beautifully paced.</h3>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                "Share their story through a soft multi-step ritual.",
                "We compose with layered prompts and quality-scored attempts.",
                "Receive your reveal page, lyrics, and optional keepsake delivery.",
              ].map((step, index) => (
                <motion.div
                  key={step}
                  initial={reduced ? undefined : { opacity: 0, y: 16 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.65, delay: index * 0.08 }}
                  className="rounded-2xl border border-stone-200/75 bg-white/72 p-5"
                >
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-stone-500">0{index + 1}</p>
                  <p className="text-sm leading-relaxed text-stone-700">{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="pricing" className="mt-16 pb-6 md:mt-24">
          <motion.div
            style={{ y: reduced ? undefined : pricingDrift }}
            initial={reduced ? undefined : { opacity: 0, y: 18, filter: "blur(8px)" }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] border border-stone-300/55 bg-[linear-gradient(145deg,rgba(37,33,31,0.92),rgba(63,53,47,0.88))] p-8 shadow-[0_30px_90px_rgba(24,20,18,0.45)] md:p-10"
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Collection Pricing</p>
                <h3 className="mt-3 font-serif text-4xl text-stone-100 md:text-5xl">Crafted to feel boutique, built to last.</h3>
              </div>
              <Link
                href="/in-memory"
                className="rounded-full border border-stone-200/60 px-6 py-3 text-sm font-semibold !text-white visited:!text-white transition duration-500 hover:bg-white/10"
              >
                View details
              </Link>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {TIERS.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={reduced ? undefined : { opacity: 0, y: 14 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.58, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/15 bg-white/8 p-5"
                >
                  <p className="font-serif text-2xl text-white">{tier.name}</p>
                  <p className="mt-2 text-sm font-semibold text-stone-200">{tier.price}</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-300">{tier.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="care" className="mt-16 md:mt-24">
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] border border-white/55 bg-white/68 p-7 shadow-[0_24px_70px_rgba(58,50,45,0.12)] backdrop-blur-xl md:p-10"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Care And Trust</p>
            <h3 className="mt-3 font-serif text-4xl text-stone-900 md:text-5xl">Compassionate operations at every step.</h3>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Clear delivery windows",
                  detail: "Digital reveals usually arrive in 10-30 minutes, and within 12 hours during high-volume periods.",
                },
                {
                  title: "Privacy-first defaults",
                  detail: "Memory pages are private by default, with sharing controlled by you through explicit visibility settings.",
                },
                {
                  title: "Grief-safe support",
                  detail: "Support communication is gentle, practical, and designed for sensitive contexts.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={reduced ? undefined : { opacity: 0, y: 10 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.62, delay: index * 0.06 }}
                  className="rounded-2xl border border-stone-200/80 bg-white/75 p-5"
                >
                  <p className="font-serif text-2xl text-stone-900">{item.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">{item.detail}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/terms"
                className="rounded-full border border-stone-300/70 bg-white/75 px-5 py-2 text-sm font-semibold text-stone-700 transition duration-500 hover:bg-white"
              >
                Terms
              </Link>
              <Link
                href="/refund"
                className="rounded-full border border-stone-300/70 bg-white/75 px-5 py-2 text-sm font-semibold text-stone-700 transition duration-500 hover:bg-white"
              >
                Refunds
              </Link>
              <Link
                href="/privacy"
                className="rounded-full border border-stone-300/70 bg-white/75 px-5 py-2 text-sm font-semibold text-stone-700 transition duration-500 hover:bg-white"
              >
                Privacy
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="mt-16 md:mt-24">
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] border border-white/55 bg-white/68 p-7 shadow-[0_24px_70px_rgba(58,50,45,0.12)] backdrop-blur-xl md:p-10"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Frequently Asked</p>
            <h3 className="mt-3 font-serif text-4xl text-stone-900 md:text-5xl">What most people ask before beginning.</h3>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  question: "How long does composing take?",
                  answer: "Most compositions are delivered in under an hour, with a compassionate fallback window up to 12 hours.",
                },
                {
                  question: "Can I request changes?",
                  answer: "Yes. Revision availability depends on your tier and selected add-ons, with clear expectations at checkout.",
                },
                {
                  question: "Do I need to share publicly?",
                  answer: "No. Your memory page is private unless you explicitly make it public or share a private link.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.question}
                  initial={reduced ? undefined : { opacity: 0, y: 10 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.62, delay: index * 0.06 }}
                  className="rounded-2xl border border-stone-200/80 bg-white/75 p-5"
                >
                  <p className="font-semibold text-stone-900">{item.question}</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="begin" className="mt-16 pb-6 md:mt-24">
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] border border-stone-300/55 bg-[linear-gradient(145deg,rgba(37,33,31,0.95),rgba(53,45,41,0.92))] p-8 shadow-[0_30px_90px_rgba(24,20,18,0.45)] md:p-10"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Begin When Ready</p>
            <h3 className="mt-3 max-w-3xl font-serif text-4xl text-stone-100 md:text-5xl">
              Start your ritual with calm guidance and keep what matters most, held in song.
            </h3>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/begin/in-memory"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition duration-500 hover:-translate-y-0.5"
              >
                Begin In Memory
              </Link>
              <Link
                href="/begin/in-love"
                className="rounded-full border border-stone-200/50 bg-transparent px-6 py-3 text-sm font-semibold !text-white visited:!text-white transition duration-500 hover:bg-white/10"
              >
                Begin In Love
              </Link>
            </div>
          </motion.div>
        </section>
      </SiteShell>
    </div>
  );
}
