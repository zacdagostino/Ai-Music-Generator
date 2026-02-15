"use client";

import { SessionProvider } from "next-auth/react";

import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { MotionProvider } from "@/components/providers/motion-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MotionProvider>
        <AnalyticsProvider />
        {children}
      </MotionProvider>
    </SessionProvider>
  );
}
