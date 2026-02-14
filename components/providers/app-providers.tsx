"use client";

import { SessionProvider } from "next-auth/react";

import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { AtmosphereBackground } from "@/components/atmosphere/atmosphere-background";
import { DustParticlesCanvas } from "@/components/atmosphere/dust-particles-canvas";
import { ParallaxProvider } from "@/components/atmosphere/parallax-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MotionProvider>
        <ParallaxProvider>
          <AtmosphereBackground />
          <DustParticlesCanvas />
          <AnalyticsProvider />
          {children}
        </ParallaxProvider>
      </MotionProvider>
    </SessionProvider>
  );
}
