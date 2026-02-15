"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const statuses = [
  "NOT_REQUIRED",
  "PENDING_DETAILS",
  "READY_FOR_PRODUCTION",
  "IN_PRODUCTION",
  "READY_TO_SHIP",
  "SHIPPED",
  "DELIVERED",
  "ON_HOLD",
  "CANCELED",
] as const;

export function FulfillmentControls({
  orderId,
  currentStatus,
  currentTracking,
  currentNotes,
}: {
  orderId: string;
  currentStatus: string;
  currentTracking?: string | null;
  currentNotes?: string | null;
}) {
  const [shippingStatus, setShippingStatus] = useState<(typeof statuses)[number]>(
    statuses.includes(currentStatus as (typeof statuses)[number])
      ? (currentStatus as (typeof statuses)[number])
      : "PENDING_DETAILS",
  );
  const [trackingNumber, setTrackingNumber] = useState(currentTracking ?? "");
  const [fulfillmentNotes, setFulfillmentNotes] = useState(currentNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-stone-500">Fulfillment controls</p>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs text-stone-500">Shipping status</span>
          <select
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2"
            value={shippingStatus}
            onChange={(event) => setShippingStatus(event.target.value as (typeof statuses)[number])}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-stone-500">Tracking number</span>
          <Input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="USPS/UPS/FedEx" />
        </label>
      </div>

      <label className="mt-3 block space-y-1">
        <span className="text-xs text-stone-500">Fulfillment notes</span>
        <Textarea
          className="min-h-24"
          value={fulfillmentNotes}
          onChange={(event) => setFulfillmentNotes(event.target.value)}
          placeholder="Production notes, delay notices, address correction logs..."
        />
      </label>

      <div className="mt-3 flex items-center gap-3">
        <Button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            setSaved(false);
            const response = await fetch(`/api/admin/orders/${orderId}/fulfillment`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shippingStatus, trackingNumber, fulfillmentNotes }),
            });

            setSaving(false);
            if (response.ok) setSaved(true);
          }}
        >
          {saving ? "Saving..." : "Update fulfillment"}
        </Button>
        {saved && <span className="text-xs text-emerald-700">Updated</span>}
      </div>
    </div>
  );
}
