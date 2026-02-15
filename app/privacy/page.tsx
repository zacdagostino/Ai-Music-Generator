import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <Card className="mx-auto max-w-3xl space-y-4 text-sm text-stone-600">
        <h1 className="font-serif text-4xl text-stone-800">Privacy</h1>
        <p>Your stories, photos, and composition assets are stored privately by default.</p>
        <p>Memory pages remain private unless explicitly shared or set public by the order owner.</p>
        <p>
          Launch analytics capture journey events (page view, ritual start/completion, checkout start, purchase,
          reveal view) to improve service quality and conversion performance.
        </p>
      </Card>
    </SiteShell>
  );
}
