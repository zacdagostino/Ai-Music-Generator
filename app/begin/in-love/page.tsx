import { InLoveRitualForm } from "@/components/ritual/in-love-ritual-form";
import { SiteShell } from "@/components/ui/site-shell";

export default function BeginInLovePage() {
  return (
    <SiteShell>
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Guided Ritual</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-800">In Love Interview</h1>
      </div>
      <InLoveRitualForm />
    </SiteShell>
  );
}
