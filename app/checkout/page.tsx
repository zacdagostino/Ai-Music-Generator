"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SiteShell } from "@/components/ui/site-shell";
import { ADD_ONS, COLLECTIONS, TIERS } from "@/lib/constants";

type Tier = "SACRED_COMPOSITION" | "VISUAL_TRIBUTE" | "LEGACY_COLLECTION";
type EventType = "IN_MEMORY" | "IN_LOVE";
const PHYSICAL_ADD_ON_KEYS = ["qrCard", "linenPrint"] as const;

type ShippingAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: "US";
};

function CheckoutContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  const [tier, setTier] = useState<Tier>("SACRED_COMPOSITION");
  const [eventType, setEventType] = useState<EventType>("IN_MEMORY");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [recipientName, setRecipientName] = useState("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    void (async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.tier) setTier(data.tier);
      if (Array.isArray(data.addOnsJson)) setSelectedAddOns(data.addOnsJson);
      if (data.eventType) setEventType(data.eventType);
      if (data.recipientName) setRecipientName(data.recipientName);
      if (data.shippingAddressJson) {
        setShippingAddress({
          line1: data.shippingAddressJson.line1 ?? "",
          line2: data.shippingAddressJson.line2 ?? "",
          city: data.shippingAddressJson.city ?? "",
          state: data.shippingAddressJson.state ?? "",
          postalCode: data.shippingAddressJson.postalCode ?? "",
          country: "US",
        });
      }
    })();
  }, [orderId]);

  const collectionCopy = COLLECTIONS[eventType];

  const physicalRequired = useMemo(() => {
    if (tier === "LEGACY_COLLECTION") return true;
    return selectedAddOns.some((key) => PHYSICAL_ADD_ON_KEYS.includes(key as (typeof PHYSICAL_ADD_ON_KEYS)[number]));
  }, [selectedAddOns, tier]);

  const startCheckout = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);

    const patchResponse = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tier,
        addOns: selectedAddOns,
        recipientName: recipientName || undefined,
        shippingAddress: physicalRequired
          ? {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2 || undefined,
              city: shippingAddress.city,
              state: shippingAddress.state.toUpperCase(),
              postalCode: shippingAddress.postalCode,
              country: "US",
            }
          : undefined,
      }),
    });

    if (!patchResponse.ok) {
      const patchData = await patchResponse.json().catch(() => ({}));
      setError(patchData.error?.formErrors?.[0] ?? "Could not prepare order details.");
      setLoading(false);
      return;
    }

    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "checkout_started",
        payload: { orderId, tier, collection: eventType },
      }),
    });

    const checkout = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await checkout.json();
    if (!checkout.ok) {
      setError(data.error ?? "Checkout could not be started. Please review your details.");
      setLoading(false);
      return;
    }

    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  return (
    <SiteShell>
      <Card className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{collectionCopy.title}</p>
          <h1 className="font-serif text-4xl text-stone-800">Choose your composition tier</h1>
          <p className="text-sm text-stone-600">
            {eventType === "IN_MEMORY"
              ? "Each tier deepens remembrance through ceremony, presentation, and keepsake permanence."
              : "Each tier deepens your love story through ceremony, presentation, and keepsake permanence."}
          </p>
        </div>

        <div className="grid gap-3">
          {(Object.keys(TIERS) as Tier[]).map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-2xl border p-4 text-left transition ${
                tier === item ? "border-stone-800 bg-stone-900 text-white" : "border-stone-200 bg-white/70"
              }`}
              onClick={() => setTier(item)}
            >
              <p className="font-serif text-2xl">{TIERS[item].name}</p>
              <p className="mt-1 text-sm opacity-90">${(TIERS[item].price / 100).toFixed(0)}</p>
              <p className="mt-2 text-sm opacity-80">{TIERS[item].description}</p>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-stone-700">Add-ons</p>
          <div className="grid gap-2 md:grid-cols-2">
            {ADD_ONS.map((addOn) => {
              const checked = selectedAddOns.includes(addOn.key);
              return (
                <label key={addOn.key} className="rounded-xl border border-stone-200 bg-white/70 p-3 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={checked}
                    onChange={(event) => {
                      setSelectedAddOns((prev) =>
                        event.target.checked ? [...prev, addOn.key] : prev.filter((entry) => entry !== addOn.key),
                      );
                    }}
                  />
                  {addOn.name} (+${(addOn.price / 100).toFixed(0)})
                </label>
              );
            })}
          </div>
        </div>

        {physicalRequired && (
          <div className="space-y-4 rounded-2xl border border-stone-200 bg-white/60 p-4">
            <p className="text-sm font-medium text-stone-700">US shipping details required for physical keepsakes</p>
            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient full name" />
            <Input
              value={shippingAddress.line1}
              onChange={(e) => setShippingAddress((current) => ({ ...current, line1: e.target.value }))}
              placeholder="Address line 1"
            />
            <Input
              value={shippingAddress.line2}
              onChange={(e) => setShippingAddress((current) => ({ ...current, line2: e.target.value }))}
              placeholder="Address line 2 (optional)"
            />
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress((current) => ({ ...current, city: e.target.value }))}
                placeholder="City"
              />
              <Input
                value={shippingAddress.state}
                onChange={(e) =>
                  setShippingAddress((current) => ({ ...current, state: e.target.value.toUpperCase().slice(0, 2) }))
                }
                placeholder="State (e.g. CA)"
              />
              <Input
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress((current) => ({ ...current, postalCode: e.target.value }))}
                placeholder="ZIP code"
              />
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm text-stone-600">
          <p className="font-medium text-stone-700">Fulfillment expectations</p>
          <p className="mt-2">Digital composition: usually within 10-30 minutes, up to 12 hours during high volume.</p>
          {physicalRequired && (
            <>
              <p className="mt-2">Physical keepsake production: 2-4 business days after digital delivery.</p>
              <p className="mt-1">US shipping: 3-7 business days after production.</p>
            </>
          )}
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <Button disabled={!orderId || loading} onClick={startCheckout}>
          {loading ? "Preparing checkout..." : "Continue to Stripe"}
        </Button>
      </Card>
    </SiteShell>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <Card className="mx-auto max-w-3xl">Loading checkout...</Card>
        </SiteShell>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
