import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function TermsPage() {
  return (
    <SiteShell>
      <Card className="mx-auto max-w-3xl space-y-4 text-sm text-stone-600">
        <h1 className="font-serif text-4xl text-stone-800">Terms</h1>
        <p>
          Held in Song provides personalized compositions created from stories submitted by customers. Delivery windows
          are service targets, not guaranteed timestamps.
        </p>
        <p>
          By ordering, you confirm you have rights to any text, photos, and names you submit. We ask customers to use
          this service in a respectful, non-harmful way.
        </p>
        <p>
          Physical keepsakes are fulfilled for US shipping addresses only during this launch period. Production delays,
          stock constraints, or address issues may adjust timelines.
        </p>
      </Card>
    </SiteShell>
  );
}
