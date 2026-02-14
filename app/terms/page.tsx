import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function TermsPage() {
  return (
    <SiteShell>
      <Card className="mx-auto max-w-3xl space-y-4 text-sm text-stone-600">
        <h1 className="font-serif text-4xl text-stone-800">Terms</h1>
        <p>Held in Song provides personalized compositions. Delivery estimates are not guaranteed turnaround times.</p>
        <p>By placing an order, you confirm submitted stories and images are yours to share.</p>
      </Card>
    </SiteShell>
  );
}
