"use client";

import { useEffect, useRef } from "react";

import { useMotionPrefs } from "../providers/motion-provider";
import { useParallax } from "./parallax-provider";

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

export function DustParticlesCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { reduced } = useMotionPrefs();
  const parallax = useParallax();

  useEffect(() => {
    if (reduced) return;

    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.length = 0;
      for (let i = 0; i < 110; i += 1) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          r: Math.random() * 1.3 + 0.3,
        });
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(120, 110, 100, 0.09)";

      particles.forEach((p) => {
        p.x += p.vx + parallax.x * 0.06;
        p.y += p.vy + parallax.y * 0.06;

        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [parallax.x, parallax.y, reduced]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />;
}
