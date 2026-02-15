import { EventType, Prisma, Tier } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AnalyticsEvent =
  | "page_view"
  | "begin_ritual"
  | "complete_ritual"
  | "checkout_started"
  | "purchase"
  | "reveal_viewed";

function parseCollection(payload: Record<string, unknown>) {
  const value = payload.collection ?? payload.eventType;
  if (value === EventType.IN_MEMORY || value === EventType.IN_LOVE) return value;
  return null;
}

function parseTier(payload: Record<string, unknown>) {
  const value = payload.tier;
  if (value === Tier.SACRED_COMPOSITION || value === Tier.VISUAL_TRIBUTE || value === Tier.LEGACY_COLLECTION) {
    return value;
  }
  return null;
}

export async function trackServerEvent(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  console.log("analytics", { event, payload, at: new Date().toISOString() });

  try {
    await prisma.analyticsEvent.create({
      data: {
        event,
        orderId: typeof payload.orderId === "string" ? payload.orderId : undefined,
        collection: parseCollection(payload),
        tier: parseTier(payload),
        payloadJson: payload as unknown as Prisma.InputJsonObject,
      },
    });
  } catch (error) {
    console.error("analytics persistence failed", error);
  }
}
