import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/ui/site-shell";

export default function InLovePage() {
  return (
    <SiteShell>
      <Card className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Collection</p>
        <h1 className="mt-3 font-serif text-5xl text-stone-800">In Love</h1>
        <p className="mt-5 text-stone-600">Coming soon. A collection for weddings, anniversaries, and vows.</p>
      </Card>
    </SiteShell>
  );
}
