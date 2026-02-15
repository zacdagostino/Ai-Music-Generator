"use client";

import { useEffect, useRef } from "react";

import { useMotionPrefs } from "@/components/providers/motion-provider";
import { useParallax } from "@/components/atmosphere/parallax-provider";

type DepthParticle = {
  x: number;
  y: number;
  depth: number;
  speed: number;
  drift: number;
  size: number;
  twinkle: number;
  layer: "far" | "mid" | "near";
};

function fract(n: number) {
  return n - Math.floor(n);
}

function hash(n: number) {
  return fract(Math.sin(n * 127.1) * 43758.5453123);
}

function smoothNoise(n: number) {
  const i = Math.floor(n);
  const f = n - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

export function HomeFloatingIslandCanvas({
  grainIntensity = 0.02,
  grainSize = 12,
  grainOpacity = 1,
}: {
  grainIntensity?: number;
  grainSize?: number;
  grainOpacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parallaxXRef = useRef(0);
  const parallaxYRef = useRef(0);
  const { reduced } = useMotionPrefs();
  const parallax = useParallax();

  useEffect(() => {
    parallaxXRef.current = parallax.x;
    parallaxYRef.current = parallax.y;
  }, [parallax.x, parallax.y]);

  useEffect(() => {
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    const start = performance.now();

    const particles: DepthParticle[] = [];
    const grassBlades: Array<{ x: number; y: number; h: number; tilt: number }> = [];
    const clampedGrain = Math.max(0, Math.min(grainIntensity, 0.5));
    const clampedGrainSize = Math.max(1, Math.min(grainSize, 60));
    const clampedGrainOpacity = Math.max(0, Math.min(grainOpacity, 1));
    const grainNormalized = clampedGrain / 0.5;
    const grainStrength = Math.pow(grainNormalized, 3.4) * 3.2;
    const sizeNormalized = (clampedGrainSize - 1) / 59;
    const noiseSize = Math.round(512 - sizeNormalized * 448);
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;
    const noiseCtx = noiseCanvas.getContext("2d");
    const noiseBuffer = noiseCtx?.createImageData(noiseSize, noiseSize);

    const FOCAL_DEPTH = 0.48;
    const BLUR_STRENGTH = 13;

    const resetScene = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles.length = 0;
      const farCount = width < 768 ? 60 : 105;
      const midCount = width < 768 ? 40 : 70;
      const nearCount = width < 768 ? 18 : 34;

      for (let i = 0; i < farCount; i += 1) {
        const depth = Math.random() * 0.33;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          speed: 0.14 + Math.random() * 0.3,
          drift: (Math.random() - 0.5) * 0.22,
          size: 0.4 + Math.random() * 1.2,
          twinkle: Math.random() * Math.PI * 2,
          layer: "far",
        });
      }

      for (let i = 0; i < midCount; i += 1) {
        const depth = 0.34 + Math.random() * 0.36;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          speed: 0.09 + Math.random() * 0.22,
          drift: (Math.random() - 0.5) * 0.28,
          size: 0.9 + Math.random() * 1.9,
          twinkle: Math.random() * Math.PI * 2,
          layer: "mid",
        });
      }

      for (let i = 0; i < nearCount; i += 1) {
        const depth = 0.71 + Math.random() * 0.29;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          speed: 0.035 + Math.random() * 0.1,
          drift: (Math.random() - 0.5) * 0.2,
          size: 2.3 + Math.random() * 3.6,
          twinkle: Math.random() * Math.PI * 2,
          layer: "near",
        });
      }

      grassBlades.length = 0;
      for (let i = 0; i < 45; i += 1) {
        grassBlades.push({
          x: (Math.random() - 0.5) * 260,
          y: -14 + (Math.random() - 0.5) * 18,
          h: 2 + Math.random() * 4,
          tilt: (Math.random() - 0.5) * 4,
        });
      }

    };

    const drawAtmosphere = (t: number) => {
      const gradient = ctx.createRadialGradient(width * 0.55, height * 0.35, 60, width * 0.5, height * 0.55, width * 0.8);
      gradient.addColorStop(0, "rgba(206, 255, 181, 0.16)");
      gradient.addColorStop(0.4, "rgba(214, 238, 255, 0.14)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 4; i += 1) {
        const yBase = height * (0.28 + i * 0.1);
        ctx.beginPath();
        for (let x = -40; x <= width + 40; x += 12) {
          const nx = x * 0.01 + i * 11;
          const wave = Math.sin(nx + t * 0.18 + i) * (5 + i * 2.2);
          const wobble = (smoothNoise(nx + t * 0.07 + i * 3) - 0.5) * 18;
          const y = yBase + wave + wobble;
          if (x <= -40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = i % 2 === 0 ? "rgba(198, 255, 168, 0.16)" : "rgba(162, 219, 255, 0.13)";
        ctx.lineWidth = 1.1 + i * 0.2;
        ctx.shadowColor = "rgba(192, 255, 178, 0.34)";
        ctx.shadowBlur = 16 + i * 5;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    };

    const drawParticles = (t: number) => {
      for (const p of particles) {
        const layerDrift = p.layer === "near" ? 0.55 : p.layer === "mid" ? 0.95 : 1.2;
        p.x += p.speed + parallaxXRef.current * (0.02 + p.depth * 0.05);
        p.y +=
          p.drift * layerDrift +
          Math.sin(t * 0.25 + p.depth * 20 + p.twinkle) * (p.layer === "near" ? 0.1 : 0.05) +
          parallaxYRef.current * 0.02;

        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.y < -10) p.y = height + 10;

        const focalOffset = Math.abs(p.depth - FOCAL_DEPTH);
        const blur = Math.min(12, focalOffset * BLUR_STRENGTH);
        const alphaBase = p.layer === "near" ? 0.06 : p.layer === "mid" ? 0.09 : 0.07;
        const twinkle = 0.88 + Math.sin(t * (0.65 + p.depth) + p.twinkle) * 0.12;
        const alpha = Math.min(0.3, alphaBase * twinkle * (1 - Math.min(focalOffset * 0.35, 0.35)));

        ctx.save();
        ctx.filter = `blur(${blur.toFixed(2)}px)`;
        ctx.beginPath();
        ctx.fillStyle = `rgba(243, 236, 226, ${alpha.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.layer === "near" || p.depth > 0.8) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(225, 246, 210, ${(alpha * 0.75).toFixed(3)})`;
          ctx.arc(p.x, p.y, p.size * (p.layer === "near" ? 3.2 : 2.2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    const drawGrain = (t: number) => {
      if (grainStrength <= 0 || !noiseCtx || !noiseBuffer) return;

      const data = noiseBuffer.data;
      const scanlinePulse = 0.9 + Math.sin(t * 60) * 0.1;
      for (let y = 0; y < noiseSize; y += 1) {
        const lineBias = Math.sin((y / noiseSize) * Math.PI * 10 + t * 38) * 8;
        for (let x = 0; x < noiseSize; x += 1) {
          const i = (y * noiseSize + x) * 4;
          const bit = Math.random() > 0.5 ? 255 : 0;
          const hotPixel = Math.random() > 0.987 ? 255 : bit;
          const value = Math.max(0, Math.min(255, hotPixel + lineBias));
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
          data[i + 3] = 255;
        }
      }
      noiseCtx.putImageData(noiseBuffer, 0, 0);

      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = Math.min(1, (0.1 + grainStrength * 0.12) * scanlinePulse * clampedGrainOpacity);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(noiseCanvas, 0, 0, width, height);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = Math.min(0.45, (0.06 + grainStrength * 0.04) * clampedGrainOpacity);
      const lineGap = 2;
      for (let y = 0; y < height; y += lineGap) {
        const a = ((y / lineGap + Math.floor(t * 30)) % 2 === 0 ? 0.65 : 0.25) * (0.5 + grainStrength * 0.08);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.fillRect(0, y, width, 1);
      }
      ctx.restore();

      if (Math.random() > 0.94) {
        const glitchY = Math.random() * height;
        const glitchH = 1 + Math.random() * 3;
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = (0.25 + grainStrength * 0.06) * clampedGrainOpacity;
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(0, glitchY, width, glitchH);
        ctx.restore();
      }
    };

    const drawScene = (t: number) => {
      const cameraAngle = t * 0.22;
      const cameraRadius = width < 768 ? 14 : 30;
      const cameraX = Math.cos(cameraAngle) * cameraRadius;
      const cameraY = Math.sin(cameraAngle * 0.65) * 8;
      const cameraDepth = (Math.sin(cameraAngle) + 1) * 0.5;

      const cx = width * 0.5 + parallaxXRef.current * 14 + cameraX;
      const cy = height * 0.58 + parallaxYRef.current * 10 + cameraY;
      const orbit = t * 0.14;
      const bob = Math.sin(t * 0.8) * 6;
      const islandTilt = Math.sin(cameraAngle * 0.9) * 0.04;

      const islandW = 184 + cameraDepth * 24 + Math.sin(orbit) * 8;
      const islandH = 58 + (1 - cameraDepth) * 10 + Math.cos(orbit * 1.3) * 4;

      const islandGradient = ctx.createLinearGradient(cx, cy - 45 + bob, cx, cy + 95 + bob);
      islandGradient.addColorStop(0, "rgba(145, 160, 110, 0.95)");
      islandGradient.addColorStop(0.35, "rgba(114, 98, 82, 0.9)");
      islandGradient.addColorStop(1, "rgba(77, 64, 56, 0.9)");

      ctx.save();
      ctx.translate(cx, cy + bob);
      ctx.rotate(islandTilt);

      const glow = ctx.createRadialGradient(0, -20, 30, 0, 0, islandW * 1.8);
      glow.addColorStop(0, "rgba(206, 255, 186, 0.16)");
      glow.addColorStop(0.45, "rgba(187, 228, 255, 0.1)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(0, -4, islandW * 1.8, islandH * 1.6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(53, 44, 38, 0.24)";
      ctx.beginPath();
      ctx.ellipse(0, 86, islandW * 0.75, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = islandGradient;
      ctx.beginPath();
      ctx.moveTo(-islandW * 0.82, -8);
      ctx.quadraticCurveTo(0, 44, islandW * 0.82, -8);
      ctx.lineTo(islandW * 0.45, 98);
      ctx.quadraticCurveTo(0, 136, -islandW * 0.45, 98);
      ctx.closePath();
      ctx.fill();

      const topGradient = ctx.createRadialGradient(0, -20, 10, 0, -12, islandW * 0.95);
      topGradient.addColorStop(0, "rgba(188, 214, 150, 0.94)");
      topGradient.addColorStop(1, "rgba(111, 140, 97, 0.92)");
      ctx.fillStyle = topGradient;
      ctx.beginPath();
      ctx.ellipse(0, -12, islandW, islandH, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(227, 243, 199, 0.18)";
      for (const blade of grassBlades) {
        const x = blade.x;
        const y = blade.y;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + blade.tilt, y - blade.h);
        ctx.stroke();
      }

      const sway = Math.sin(t * 1.1) * 3 + Math.sin(cameraAngle) * 2;
      ctx.save();
      ctx.translate(sway + (cameraDepth - 0.5) * 12, -28);

      const trunkGrad = ctx.createLinearGradient(0, -20, 0, 45);
      trunkGrad.addColorStop(0, "rgba(110, 77, 57, 0.96)");
      trunkGrad.addColorStop(1, "rgba(79, 55, 42, 0.95)");
      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      ctx.moveTo(-13, 42);
      ctx.quadraticCurveTo(-9, 8, -4, -20);
      ctx.quadraticCurveTo(2, -26, 9, -17);
      ctx.quadraticCurveTo(12, 8, 15, 42);
      ctx.closePath();
      ctx.fill();

      const canopy = ctx.createRadialGradient(0, -52, 20, 0, -36, 74);
      canopy.addColorStop(0, "rgba(206, 228, 175, 0.97)");
      canopy.addColorStop(0.55, "rgba(154, 183, 130, 0.94)");
      canopy.addColorStop(1, "rgba(90, 118, 84, 0.92)");
      ctx.fillStyle = canopy;
      ctx.shadowColor = "rgba(178, 245, 171, 0.34)";
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.ellipse(0, -38, 68, 52, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(-40, -28, 26, 19, -0.3, 0, Math.PI * 2);
      ctx.ellipse(39, -32, 24, 17, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.filter = "none";
    };

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      drawAtmosphere(t);
      drawParticles(t);
      drawScene(t);
      drawGrain(t);
      frame = requestAnimationFrame(tick);
    };

    resetScene();
    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resetScene);

    return () => {
      window.removeEventListener("resize", resetScene);
      cancelAnimationFrame(frame);
    };
  }, [grainIntensity, grainOpacity, grainSize, reduced]);

  if (reduced) {
    return null;
  }

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[-15]" aria-hidden="true" />;
}
