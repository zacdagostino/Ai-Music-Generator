import { FulfillmentStatus, Tier } from "@prisma/client";

import { shippingAddressSchema } from "../schemas";

export const PHYSICAL_ADD_ON_KEYS = ["qrCard", "linenPrint"] as const;

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: "US";
};

export function tierIncludesPhysical(tier: Tier) {
  return tier === Tier.LEGACY_COLLECTION;
}

export function requiresPhysicalFulfillment(tier: Tier, addOns: string[]) {
  if (tierIncludesPhysical(tier)) return true;
  return addOns.some((item) => (PHYSICAL_ADD_ON_KEYS as readonly string[]).includes(item));
}

export function shippingDetailsProvided(recipientName?: string | null, shippingAddressJson?: unknown) {
  if (!recipientName || !recipientName.trim()) return false;

  const parsed = shippingAddressSchema.safeParse(shippingAddressJson);
  return parsed.success;
}

export function getShippingStatusForDetails(
  physicalRequired: boolean,
  recipientName?: string | null,
  shippingAddressJson?: unknown,
) {
  if (!physicalRequired) return FulfillmentStatus.NOT_REQUIRED;

  return shippingDetailsProvided(recipientName, shippingAddressJson)
    ? FulfillmentStatus.READY_FOR_PRODUCTION
    : FulfillmentStatus.PENDING_DETAILS;
}

export function getPostPaymentShippingStatus(current: FulfillmentStatus, physicalRequired: boolean) {
  if (!physicalRequired) return FulfillmentStatus.NOT_REQUIRED;
  if (current === FulfillmentStatus.PENDING_DETAILS) return FulfillmentStatus.PENDING_DETAILS;
  if (current === FulfillmentStatus.SHIPPED || current === FulfillmentStatus.DELIVERED) return current;

  return FulfillmentStatus.IN_PRODUCTION;
}

export const DIGITAL_DELIVERY_SLA = "Usually within 10-30 minutes. During high volume, within 12 hours.";
export const PHYSICAL_PRODUCTION_SLA = "Production in 2-4 business days after composition delivery.";
export const PHYSICAL_SHIPPING_SLA = "US shipping in 3-7 business days after production.";

export const FULFILLMENT_EXCEPTION_NOTES = {
  generationFailure: "If composition generation fails after retries, we contact the client and offer recompose or full refund.",
  stockOrPrintDelay: "If physical stock or printing is delayed, we notify within one business day and provide revised ETA.",
  addressIssue: "If shipping address is invalid, fulfillment is paused until corrected details are provided.",
} as const;
