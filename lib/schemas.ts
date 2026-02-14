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

export const updateOrderSchema = z.object({
  tier: z.nativeEnum(Tier),
  addOns: z.array(z.string()).default([]),
});

export type RitualAnswers = z.infer<typeof ritualAnswersSchema>;
