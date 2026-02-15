import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function RefundPage() {
  return (
    <SiteShell>
      <Card className="mx-auto max-w-3xl space-y-4 text-sm text-stone-600">
        <h1 className="font-serif text-4xl text-stone-800">Refund Policy</h1>
        <p>
          If composition generation fails after retries and we cannot deliver a final composition, full refunds are
          available.
        </p>
        <p>
          Once a composition is delivered, support is provided first through included revisions (plus add-ons where
          purchased). Refund requests after delivery are handled with compassionate case review.
        </p>
        <p>
          For physical keepsakes, confirmed production or shipped items may be non-refundable unless damage or shipping
          fault occurs.
        </p>
      </Card>
    </SiteShell>
  );
}
