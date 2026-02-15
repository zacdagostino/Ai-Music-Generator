"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RitualTransition } from "@/components/ritual/ritual-transition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const feelings = ["Peace", "Gratitude", "Reflection", "Love", "Release", "Hope"] as const;
const styles = ["Gentle piano", "Soft acoustic", "Ambient minimal", "Orchestral swell"] as const;
const relationshipChoices = ["Partner", "Spouse", "Fiance", "Boyfriend", "Girlfriend", "Best friend", "Other"];

const totalSteps = 9;

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.07, delayChildren: 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.35, ease: [0.42, 0, 0.58, 1] } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

type LovePrompt = { id: string; question: string; starter: string };

function buildLovePrompts(person: string, relationship: string): LovePrompt[] {
  const who = person.trim() || "them";
  return [
    {
      id: "first",
      question: `What is the first moment you knew ${who} mattered deeply?`,
      starter: `I knew ${who} was special when `,
    },
    {
      id: "ritual",
      question: `What small ritual do you share as ${relationship.toLowerCase()} and partner?`,
      starter: `One little ritual we always return to is `,
    },
    {
      id: "inside",
      question: "Is there an inside joke or phrase that only the two of you understand?",
      starter: "The phrase that always feels like us is ",
    },
    {
      id: "future",
      question: `What future wish would you want ${who} to hear in this song?`,
      starter: "My wish for our future is ",
    },
  ];
}

export function InLoveRitualForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [helperOpen, setHelperOpen] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [form, setForm] = useState({
    honoreeName: "",
    relationshipType: "Partner",
    relationshipText: "",
    descriptorOne: "",
    descriptorTwo: "",
    descriptorThree: "",
    descriptorNotes: "",
    vividMemory: "",
    alwaysSaid: "",
    letterMode: "",
    feeling: "Love",
    musicStyle: "Soft acoustic",
    email: "",
  });

  const descriptors = [form.descriptorOne, form.descriptorTwo, form.descriptorThree]
    .map((v) => v.trim())
    .filter(Boolean);
  const canContinueStep3 = descriptors.length >= 3;
  const prompts = buildLovePrompts(form.honoreeName, form.relationshipType);

  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "begin_ritual", payload: { collection: "IN_LOVE" } }),
    });
  }, []);

  const submit = async () => {
    setSubmitting(true);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        eventType: "IN_LOVE",
        answers: {
          honoreeName: form.honoreeName,
          relationshipType: form.relationshipType,
          relationshipText: form.relationshipText,
          descriptors,
          descriptorNotes: form.descriptorNotes,
          vividMemory: form.vividMemory,
          alwaysSaid: form.alwaysSaid,
          letterMode: form.letterMode,
          feeling: form.feeling,
          musicStyle: form.musicStyle,
        },
      }),
    });

    if (!response.ok) {
      setSubmitting(false);
      alert("We couldn't save your story yet. Please try again gently.");
      return;
    }

    const order = await response.json();
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "complete_ritual", payload: { orderId: order.id, collection: "IN_LOVE" } }),
    });

    router.push(`/checkout?orderId=${order.id}`);
  };

  const applyStarter = (prompt: LovePrompt) => {
    setSelectedPromptId(prompt.id);
    setForm((current) => ({
      ...current,
      vividMemory: current.vividMemory.trim() ? `${current.vividMemory}\n${prompt.starter}` : prompt.starter,
    }));
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <Progress current={step} total={totalSteps} />
      <div className="mt-8 min-h-96">
        <RitualTransition id={`step-love-${step}`}>
          <motion.div className="space-y-4" variants={stepVariants} initial="hidden" animate="show" exit="exit">
            {step === 1 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">Who is this song for?</motion.h2>
                <motion.div variants={itemVariants}>
                  <Input
                    value={form.honoreeName}
                    onChange={(event) => setForm((f) => ({ ...f, honoreeName: event.target.value }))}
                    placeholder="Their name"
                  />
                </motion.div>
              </>
            )}

            {step === 2 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">What is your relationship?</motion.h2>
                <motion.select
                  variants={itemVariants}
                  className="w-full rounded-2xl border border-stone-200 bg-white/70 px-4 py-3"
                  value={form.relationshipType}
                  onChange={(event) => setForm((f) => ({ ...f, relationshipType: event.target.value }))}
                >
                  {relationshipChoices.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </motion.select>
                <motion.div variants={itemVariants}>
                  <Input
                    value={form.relationshipText}
                    onChange={(event) => setForm((f) => ({ ...f, relationshipText: event.target.value }))}
                    placeholder="Optional detail"
                  />
                </motion.div>
              </>
            )}

            {step === 3 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">Describe your love in three words</motion.h2>
                <motion.div variants={itemVariants} className="grid gap-3 md:grid-cols-3">
                  <Input value={form.descriptorOne} onChange={(event) => setForm((f) => ({ ...f, descriptorOne: event.target.value }))} placeholder="Word 1" />
                  <Input value={form.descriptorTwo} onChange={(event) => setForm((f) => ({ ...f, descriptorTwo: event.target.value }))} placeholder="Word 2" />
                  <Input value={form.descriptorThree} onChange={(event) => setForm((f) => ({ ...f, descriptorThree: event.target.value }))} placeholder="Word 3" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Input
                    value={form.descriptorNotes}
                    onChange={(event) => setForm((f) => ({ ...f, descriptorNotes: event.target.value }))}
                    placeholder="Optional notes"
                  />
                </motion.div>
              </>
            )}

            {step === 4 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">One vivid memory together</motion.h2>
                <motion.div variants={itemVariants}>
                  <Textarea
                    value={form.vividMemory}
                    onChange={(event) => setForm((f) => ({ ...f, vividMemory: event.target.value }))}
                    placeholder="A little scene, place, or moment that feels like you two..."
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="rounded-2xl border border-stone-200/80 bg-white/60 p-4">
                  <button
                    type="button"
                    onClick={() => setHelperOpen((open) => !open)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-sm font-medium text-stone-700">Need help writing? Gentle prompt starters</span>
                    <motion.span animate={{ rotate: helperOpen ? 180 : 0 }} transition={{ duration: 0.35 }} className="text-stone-500">↓</motion.span>
                  </button>

                  <AnimatePresence>
                    {helperOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="space-y-2">
                          {prompts.map((prompt) => (
                            <button
                              key={prompt.id}
                              type="button"
                              onClick={() => applyStarter(prompt)}
                              className={`w-full rounded-2xl border p-3 text-left text-sm transition ${
                                selectedPromptId === prompt.id ? "border-emerald-300 bg-emerald-50/80" : "border-stone-200 bg-white/70"
                              }`}
                            >
                              <p className="text-stone-800">{prompt.question}</p>
                              <p className="mt-1 text-xs text-stone-600">Starter: “{prompt.starter}...”</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </>
            )}

            {step === 5 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">Something they always say</motion.h2>
                <motion.div variants={itemVariants}>
                  <Input
                    value={form.alwaysSaid}
                    onChange={(event) => setForm((f) => ({ ...f, alwaysSaid: event.target.value }))}
                    placeholder="Optional phrase"
                  />
                </motion.div>
              </>
            )}

            {step === 6 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">If you could say one more thing...</motion.h2>
                <motion.div variants={itemVariants}>
                  <Textarea
                    value={form.letterMode}
                    onChange={(event) => setForm((f) => ({ ...f, letterMode: event.target.value }))}
                    placeholder="A gentle note to your person"
                  />
                </motion.div>
              </>
            )}

            {step === 7 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">What feeling should this song hold?</motion.h2>
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
                  {feelings.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setForm((f) => ({ ...f, feeling: item }))}
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        form.feeling === item ? "border-stone-800 bg-stone-900 text-white" : "border-stone-200"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </motion.div>
              </>
            )}

            {step === 8 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">What music feels closest to your story?</motion.h2>
                <motion.div variants={itemVariants} className="space-y-2">
                  {styles.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setForm((f) => ({ ...f, musicStyle: item }))}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                        form.musicStyle === item ? "border-stone-800 bg-stone-900 text-white" : "border-stone-200"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </motion.div>
              </>
            )}

            {step === 9 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">Thank you for sharing your story.</motion.h2>
                <motion.p variants={itemVariants} className="text-sm text-stone-600">
                  We&apos;ll shape this with care. Please share the best email for your reveal and delivery updates.
                </motion.p>
                <motion.div variants={itemVariants}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
                    placeholder="you@example.com"
                  />
                </motion.div>
              </>
            )}
          </motion.div>
        </RitualTransition>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} className="bg-white text-stone-700" disabled={step === 1 || submitting}>
          Back
        </Button>
        {step < totalSteps ? (
          <Button type="button" onClick={() => setStep((s) => Math.min(totalSteps, s + 1))} disabled={submitting || (step === 3 && !canContinueStep3)}>
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={submitting || !form.email}>
            {submitting ? "Saving..." : "Continue to checkout"}
          </Button>
        )}
      </div>
    </Card>
  );
}
