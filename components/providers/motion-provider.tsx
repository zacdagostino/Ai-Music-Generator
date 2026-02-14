"use client";

import { createContext, useContext, useMemo, useState } from "react";

type MotionContextValue = {
  reduced: boolean;
  setReduced: (value: boolean) => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    const preferred = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saved = localStorage.getItem("held-in-song-reduced-motion");
    return saved ? saved === "true" : preferred;
  });

  const value = useMemo(
    () => ({
      reduced,
      setReduced: (next: boolean) => {
        setReduced(next);
        localStorage.setItem("held-in-song-reduced-motion", String(next));
      },
    }),
    [reduced],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotionPrefs() {
  const context = useContext(MotionContext);
  if (!context) throw new Error("useMotionPrefs must be used inside MotionProvider");
  return context;
}
