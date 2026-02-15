import { describe, expect, it } from "vitest";

import {
  getPostPaymentShippingStatus,
  getShippingStatusForDetails,
  requiresPhysicalFulfillment,
} from "../lib/services/fulfillment";

describe("fulfillment helpers", () => {
  it("requires physical fulfillment for legacy tier", () => {
    expect(requiresPhysicalFulfillment("LEGACY_COLLECTION", [])).toBe(true);
  });

  it("requires physical fulfillment when QR add-on is selected", () => {
    expect(requiresPhysicalFulfillment("SACRED_COMPOSITION", ["qrCard"])).toBe(true);
  });

  it("does not require physical fulfillment for digital-only order", () => {
    expect(requiresPhysicalFulfillment("VISUAL_TRIBUTE", ["fastDelivery"])).toBe(false);
  });

  it("returns pending details when physical order is missing address", () => {
    expect(getShippingStatusForDetails(true, "Zac", undefined)).toBe("PENDING_DETAILS");
  });

  it("returns ready for production when US details are valid", () => {
    expect(
      getShippingStatusForDetails(true, "Zac", {
        line1: "123 Cedar St",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
        country: "US",
      }),
    ).toBe("READY_FOR_PRODUCTION");
  });

  it("moves to in production after payment when details are present", () => {
    expect(getPostPaymentShippingStatus("READY_FOR_PRODUCTION", true)).toBe("IN_PRODUCTION");
  });

  it("keeps pending details status after payment when address is missing", () => {
    expect(getPostPaymentShippingStatus("PENDING_DETAILS", true)).toBe("PENDING_DETAILS");
  });
});
