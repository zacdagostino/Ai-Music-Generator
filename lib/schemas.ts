import { EventType, Tier } from "@prisma/client";
import { z } from "zod";

export const ritualAnswersSchema = z.object({
  honoreeName: z.string().min(1),
  relationshipType: z.string().min(1),
  relationshipText: z.string().optional(),
  descriptors: z.array(z.string()).min(1).max(3),
  descriptorNotes: z.string().optional(),
  vividMemory: z.string().min(10),
  alwaysSaid: z.string().optional(),
  letterMode: z.string().optional(),
  feeling: z.enum(["Peace", "Gratitude", "Reflection", "Love", "Release", "Hope"]),
  musicStyle: z.enum(["Gentle piano", "Soft acoustic", "Ambient minimal", "Orchestral swell"]),
});

export const createOrderSchema = z.object({
  email: z.email(),
  eventType: z.nativeEnum(EventType).default(EventType.IN_MEMORY),
  answers: ritualAnswersSchema,
});

export const shippingAddressSchema = z.object({
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2).max(80),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  postalCode: z.string().trim().regex(/^\d{5}(-\d{4})?$/),
  country: z.literal("US"),
});

export const updateOrderSchema = z.object({
  tier: z.nativeEnum(Tier),
  addOns: z.array(z.string()).default([]),
  recipientName: z.string().trim().min(2).max(120).optional(),
  shippingAddress: shippingAddressSchema.optional(),
});

export const adminFulfillmentUpdateSchema = z.object({
  shippingStatus: z.enum([
    "NOT_REQUIRED",
    "PENDING_DETAILS",
    "READY_FOR_PRODUCTION",
    "IN_PRODUCTION",
    "READY_TO_SHIP",
    "SHIPPED",
    "DELIVERED",
    "ON_HOLD",
    "CANCELED",
  ]),
  trackingNumber: z.string().trim().max(120).optional(),
  fulfillmentNotes: z.string().trim().max(1000).optional(),
});

export const orderFeedbackSchema = z.object({
  testimonialConsent: z.boolean().default(false),
  feedbackRating: z.number().int().min(1).max(5).optional(),
  feedbackText: z.string().trim().max(1200).optional(),
});

export type RitualAnswers = z.infer<typeof ritualAnswersSchema>;
