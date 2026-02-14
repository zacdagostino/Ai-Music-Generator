import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function RefundPage() {
  return (
    <SiteShell>
      <Card className="mx-auto max-w-3xl space-y-4 text-sm text-stone-600">
        <h1 className="font-serif text-4xl text-stone-800">Refund Policy</h1>
        <p>If generation fails and we cannot provide a final composition, full refunds are available.</p>
        <p>For delivered compositions, revisions are available by tier and add-ons.</p>
      </Card>
    </SiteShell>
  );
}
