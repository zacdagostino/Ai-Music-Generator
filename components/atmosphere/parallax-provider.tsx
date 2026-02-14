"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ParallaxContextValue = { x: number; y: number };
const ParallaxContext = createContext<ParallaxContextValue>({ x: 0, y: 0 });

export function ParallaxProvider({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const value = useMemo(() => position, [position]);

  return (
    <ParallaxContext.Provider value={value}>
      <div
        onMouseMove={(event) => {
          const x = (event.clientX / window.innerWidth - 0.5) * 2;
          const y = (event.clientY / window.innerHeight - 0.5) * 2;
          setPosition({ x, y });
        }}
      >
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

export function useParallax() {
  return useContext(ParallaxContext);
}
