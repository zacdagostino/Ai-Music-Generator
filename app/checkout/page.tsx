"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ADD_ONS, TIERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

type Tier = "SACRED_COMPOSITION" | "VISUAL_TRIBUTE" | "LEGACY_COLLECTION";

function CheckoutContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const [tier, setTier] = useState<Tier>("SACRED_COMPOSITION");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    if (!orderId) return;
    setLoading(true);

    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, addOns: selectedAddOns }),
    });

    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "checkout_started", payload: { orderId, tier } }),
    });

    const checkout = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await checkout.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  return (
    <SiteShell>
      <Card className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-serif text-4xl text-stone-800">Choose your composition tier</h1>
        <div className="grid gap-3">
          {(Object.keys(TIERS) as Tier[]).map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-2xl border p-4 text-left ${tier === item ? "border-stone-800 bg-stone-900 text-white" : "border-stone-200"}`}
              onClick={() => setTier(item)}
            >
              <p className="font-serif text-2xl">{TIERS[item].name}</p>
              <p className="mt-1 text-sm opacity-85">${(TIERS[item].price / 100).toFixed(0)}</p>
            </button>
          ))}
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-stone-700">Add-ons</p>
          <div className="grid gap-2 md:grid-cols-2">
            {ADD_ONS.map((addOn) => {
              const checked = selectedAddOns.includes(addOn.key);
              return (
                <label key={addOn.key} className="rounded-xl border border-stone-200 p-3 text-sm text-stone-700">
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

        <Button disabled={!orderId || loading} onClick={startCheckout}>
          {loading ? "Preparing checkout..." : "Continue to Stripe"}
        </Button>
      </Card>
    </SiteShell>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<SiteShell><Card className="mx-auto max-w-3xl">Loading checkout...</Card></SiteShell>}>
      <CheckoutContent />
    </Suspense>
  );
}
