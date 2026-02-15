"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PostPurchaseFeedback({
  orderId,
  defaultConsent,
  defaultText,
  defaultRating,
}: {
  orderId: string;
  defaultConsent: boolean;
  defaultText?: string | null;
  defaultRating?: number | null;
}) {
  const [testimonialConsent, setTestimonialConsent] = useState(defaultConsent);
  const [feedbackText, setFeedbackText] = useState(defaultText ?? "");
  const [feedbackRating, setFeedbackRating] = useState(defaultRating ?? 5);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    setSaving(true);
    setSaved(false);

    const response = await fetch(`/api/orders/${orderId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testimonialConsent,
        feedbackRating,
        feedbackText,
      }),
    });

    setSaving(false);
    setSaved(response.ok);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-stone-500">Aftercare feedback</p>
      <p className="mb-3 text-stone-600">
        Your feedback helps us refine this ceremony. If you consent, we may request permission to use a short excerpt.
      </p>

      <div className="mb-3 flex items-center gap-3">
        <label className="text-sm text-stone-700">Emotional impact</label>
        <select
          className="rounded-xl border border-stone-200 bg-white px-3 py-2"
          value={feedbackRating}
          onChange={(event) => setFeedbackRating(Number(event.target.value))}
        >
          {[5, 4, 3, 2, 1].map((score) => (
            <option key={score} value={score}>
              {score}/5
            </option>
          ))}
        </select>
      </div>

      <Textarea
        value={feedbackText}
        onChange={(event) => setFeedbackText(event.target.value)}
        placeholder="How did this feel? Would you recommend Held in Song to someone in a similar moment?"
      />

      <label className="mt-3 flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={testimonialConsent}
          onChange={(event) => setTestimonialConsent(event.target.checked)}
        />
        I consent to being contacted for testimonial permission.
      </label>

      <div className="mt-3 flex items-center gap-3">
        <Button onClick={submit} disabled={saving}>
          {saving ? "Saving..." : "Save feedback"}
        </Button>
        {saved && <span className="text-xs text-emerald-700">Saved</span>}
      </div>
    </div>
  );
}
