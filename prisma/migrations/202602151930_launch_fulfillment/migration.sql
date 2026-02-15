-- CreateEnum
CREATE TYPE "public"."FulfillmentStatus" AS ENUM (
  'NOT_REQUIRED',
  'PENDING_DETAILS',
  'READY_FOR_PRODUCTION',
  'IN_PRODUCTION',
  'READY_TO_SHIP',
  'SHIPPED',
  'DELIVERED',
  'ON_HOLD',
  'CANCELED'
);

-- AlterTable
ALTER TABLE "public"."Order"
  ADD COLUMN "recipientName" TEXT,
  ADD COLUMN "shippingAddressJson" JSONB,
  ADD COLUMN "physicalRequired" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "shippingStatus" "public"."FulfillmentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN "trackingNumber" TEXT,
  ADD COLUMN "fulfillmentNotes" TEXT,
  ADD COLUMN "fulfilledAt" TIMESTAMP(3),
  ADD COLUMN "testimonialConsent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "feedbackRating" INTEGER,
  ADD COLUMN "feedbackText" TEXT;

-- AlterTable
ALTER TABLE "public"."Payment"
  ADD COLUMN "eventType" "public"."EventType",
  ADD COLUMN "tier" "public"."Tier",
  ADD COLUMN "lastWebhookEventId" TEXT,
  ADD COLUMN "metadataJson" JSONB;

-- CreateTable
CREATE TABLE "public"."AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "orderId" TEXT,
  "collection" "public"."EventType",
  "tier" "public"."Tier",
  "payloadJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_eventType_status_idx" ON "public"."Order"("eventType", "status");

-- CreateIndex
CREATE INDEX "Order_shippingStatus_idx" ON "public"."Order"("shippingStatus");

-- CreateIndex
CREATE INDEX "Payment_eventType_tier_idx" ON "public"."Payment"("eventType", "tier");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "public"."Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_event_createdAt_idx" ON "public"."AnalyticsEvent"("event", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_collection_tier_idx" ON "public"."AnalyticsEvent"("collection", "tier");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_orderId_idx" ON "public"."AnalyticsEvent"("orderId");
