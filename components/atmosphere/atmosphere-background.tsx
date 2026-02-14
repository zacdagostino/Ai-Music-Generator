"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { useMotionPrefs } from "../providers/motion-provider";
import { useParallax } from "./parallax-provider";

export function AtmosphereBackground() {
  const { reduced } = useMotionPrefs();
  const parallax = useParallax();

  if (reduced) {
    return <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,#f5ede4_0%,#f4f0ea_40%,#ecebe6_100%)]" />;
  }

  return (
    <motion.div
      className={cn(
        "fixed inset-0 -z-20",
        "bg-[radial-gradient(circle_at_20%_20%,rgba(222,198,187,0.4)_0%,transparent_45%),radial-gradient(circle_at_80%_30%,rgba(177,190,169,0.35)_0%,transparent_45%),linear-gradient(140deg,#f5f1ea_0%,#efebe4_40%,#ece8e2_100%)]",
      )}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        x: [0, 4, 0],
      }}
      transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
      style={{ transform: `translate(${parallax.x * 5}px, ${parallax.y * 5}px)` }}
    />
  );
}
