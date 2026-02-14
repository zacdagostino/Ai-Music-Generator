"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useMotionPrefs } from "@/components/providers/motion-provider";

export function RitualTransition({ id, children }: { id: string; children: React.ReactNode }) {
  const { reduced } = useMotionPrefs();

  if (reduced) return <>{children}</>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(7px)" }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
