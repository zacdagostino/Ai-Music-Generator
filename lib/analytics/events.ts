export type AnalyticsEvent =
  | "page_view"
  | "begin_ritual"
  | "complete_ritual"
  | "checkout_started"
  | "purchase"
  | "reveal_viewed";

export async function trackServerEvent(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  console.log("analytics", { event, payload, at: new Date().toISOString() });
}
