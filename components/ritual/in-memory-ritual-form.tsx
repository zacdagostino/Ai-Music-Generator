"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { RitualTransition } from "@/components/ritual/ritual-transition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const feelings = ["Peace", "Gratitude", "Reflection", "Love", "Release", "Hope"] as const;
const styles = ["Gentle piano", "Soft acoustic", "Ambient minimal", "Orchestral swell"] as const;
const descriptorSuggestions = ["Kind", "Steady", "Gentle", "Playful", "Wise", "Warm", "Devoted", "Radiant"];

const relationshipChoices = ["Parent", "Grandparent", "Partner", "Sibling", "Child", "Friend", "Mentor", "Other"];

const totalSteps = 9;

type MemoryPrompt = {
  id: string;
  question: string;
  starter: string;
};

function buildMemoryPrompts(name: string, relationship: string, descriptorOne: string): MemoryPrompt[] {
  const safeName = name.trim() || "they";
  const warmDescriptor = descriptorOne.trim() || "their";

  return [
    {
      id: "place",
      question: `Where can you picture ${safeName} most clearly?`,
      starter: `I can still see ${safeName} in `,
    },
    {
      id: "sound",
      question: `What sound or phrase instantly brings ${safeName} back to you?`,
      starter: `The sound I always connect with ${safeName} is `,
    },
    {
      id: "touch",
      question: `What tiny detail captures their ${warmDescriptor.toLowerCase()} presence?`,
      starter: `A small detail I never forget is `,
    },
    {
      id: "ritual",
      question: `Was there a simple routine you shared as ${relationship.toLowerCase()} and loved one?`,
      starter: `One ritual we shared was `,
    },
  ];
}

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

export function InMemoryRitualForm() {
  const router = useRouter();
  const descriptorRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [descriptorConfirmed, setDescriptorConfirmed] = useState([false, false, false]);
  const [memoryHelperOpen, setMemoryHelperOpen] = useState(false);
  const [selectedMemoryPromptId, setSelectedMemoryPromptId] = useState<string | null>(null);
  const [form, setForm] = useState({
    honoreeName: "",
    relationshipType: "Parent",
    relationshipText: "",
    descriptorOne: "",
    descriptorTwo: "",
    descriptorThree: "",
    descriptorNotes: "",
    vividMemory: "",
    alwaysSaid: "",
    letterMode: "",
    feeling: "Peace",
    musicStyle: "Gentle piano",
    email: "",
  });

  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const descriptors = [form.descriptorOne, form.descriptorTwo, form.descriptorThree].map((v) => v.trim()).filter(Boolean);
  const canContinueStep3 = descriptors.length >= 3;
  const memoryPrompts = buildMemoryPrompts(form.honoreeName, form.relationshipType, form.descriptorOne);

  const setDescriptorAt = (index: number, value: string) => {
    setForm((current) => {
      const list = [current.descriptorOne, current.descriptorTwo, current.descriptorThree];
      list[index] = value;
      return {
        ...current,
        descriptorOne: list[0],
        descriptorTwo: list[1],
        descriptorThree: list[2],
      };
    });

    setDescriptorConfirmed((current) => {
      const nextState = [...current];
      nextState[index] = false;
      return nextState;
    });
  };

  const confirmDescriptor = (index: number) => {
    const list = [form.descriptorOne, form.descriptorTwo, form.descriptorThree];
    if (!list[index].trim()) return;
    setDescriptorConfirmed((current) => {
      const nextState = [...current];
      nextState[index] = true;
      return nextState;
    });
  };

  const onDescriptorKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmDescriptor(index);
      if (index < 2) {
        descriptorRefs.current[index + 1]?.focus();
      } else {
        descriptorRefs.current[index]?.blur();
      }
    }

    if (event.key === "Tab") {
      confirmDescriptor(index);
    }
  };

  const addSuggestedDescriptor = (word: string) => {
    setForm((current) => {
      const list = [current.descriptorOne, current.descriptorTwo, current.descriptorThree];
      const firstEmpty = list.findIndex((value) => !value.trim());
      if (firstEmpty === -1) return current;
      list[firstEmpty] = word;

      setTimeout(() => {
        setDescriptorConfirmed((state) => {
          const nextState = [...state];
          nextState[firstEmpty] = true;
          return nextState;
        });
      }, 0);

      if (firstEmpty < 2) {
        setTimeout(() => descriptorRefs.current[firstEmpty + 1]?.focus(), 0);
      }

      return {
        ...current,
        descriptorOne: list[0],
        descriptorTwo: list[1],
        descriptorThree: list[2],
      };
    });
  };

  const applyMemoryStarter = (prompt: MemoryPrompt) => {
    setSelectedMemoryPromptId(prompt.id);
    setForm((current) => ({
      ...current,
      vividMemory: current.vividMemory.trim() ? `${current.vividMemory}\n${prompt.starter}` : prompt.starter,
    }));
  };

  useEffect(() => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "begin_ritual", payload: { collection: "IN_MEMORY" } }),
    });
  }, []);

  const submit = async () => {
    setSubmitting(true);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        eventType: "IN_MEMORY",
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
      body: JSON.stringify({ event: "complete_ritual", payload: { orderId: order.id, collection: "IN_MEMORY" } }),
    });
    router.push(`/checkout?orderId=${order.id}`);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <Progress current={step} total={totalSteps} />
      <div className="mt-8 min-h-96">
        <RitualTransition id={`step-${step}`}>
          <motion.div className="space-y-4" variants={stepVariants} initial="hidden" animate="show" exit="exit">
            {step === 1 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">Who are we honoring?</motion.h2>
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
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">What was your relationship?</motion.h2>
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
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">Describe them in three words</motion.h2>
                <motion.p variants={itemVariants} className="text-sm text-stone-600">Choose three words. Press Enter, Tab, or click away to confirm each one.</motion.p>

                <motion.div variants={itemVariants} className="grid gap-3 md:grid-cols-3">
                  {[form.descriptorOne, form.descriptorTwo, form.descriptorThree].map((value, index) => {
                    const confirmed = descriptorConfirmed[index] && value.trim().length > 0;
                    return (
                      <motion.div
                        key={`descriptor-${index}`}
                        layout
                        animate={
                          confirmed
                            ? { backgroundColor: "rgba(235, 246, 238, 0.95)", borderColor: "rgba(120, 164, 136, 0.75)", y: -2 }
                            : { backgroundColor: "rgba(255, 255, 255, 0.7)", borderColor: "rgba(214, 211, 209, 1)", y: 0 }
                        }
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="rounded-2xl border p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Word {index + 1}</p>
                          <AnimatePresence>
                            {confirmed && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.22 }}
                                className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-700"
                              >
                                Confirmed
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        <Input
                          ref={(el) => {
                            descriptorRefs.current[index] = el;
                          }}
                          value={value}
                          onChange={(event) => setDescriptorAt(index, event.target.value)}
                          onBlur={() => confirmDescriptor(index)}
                          onKeyDown={(event) => onDescriptorKeyDown(index, event)}
                          placeholder={`Word ${index + 1}`}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                  {descriptorSuggestions.map((word) => (
                    <motion.button
                      type="button"
                      key={word}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addSuggestedDescriptor(word)}
                      className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs text-stone-700 transition hover:bg-white"
                    >
                      {word}
                    </motion.button>
                  ))}
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
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">One small vivid memory</motion.h2>
                <motion.div variants={itemVariants}>
                  <Textarea
                    value={form.vividMemory}
                    onChange={(event) => setForm((f) => ({ ...f, vividMemory: event.target.value }))}
                    placeholder="A short scene, moment, or detail that still feels alive..."
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="rounded-2xl border border-stone-200/80 bg-white/60 p-4">
                  <button
                    type="button"
                    onClick={() => setMemoryHelperOpen((open) => !open)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-sm font-medium text-stone-700">Need help remembering? Gentle AI prompts</span>
                    <motion.span
                      animate={{ rotate: memoryHelperOpen ? 180 : 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="text-stone-500"
                    >
                      ↓
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {memoryHelperOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          className="mt-4 space-y-3"
                          variants={stepVariants}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                        >
                          <motion.div
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-r from-[#f3ede7] via-[#ece8e2] to-[#e5ece3] p-3"
                          >
                            <motion.div
                              className="absolute -left-12 top-0 h-full w-10 bg-white/35 blur-md"
                              animate={{ x: ["0%", "420%"] }}
                              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <p className="relative text-xs uppercase tracking-[0.16em] text-stone-600">
                              Memory Companion
                            </p>
                            <p className="relative mt-1 text-sm text-stone-700">
                              You can tap any prompt and we&apos;ll place a gentle sentence starter into your memory box.
                            </p>
                          </motion.div>

                          {memoryPrompts.map((prompt, idx) => {
                            const active = selectedMemoryPromptId === prompt.id;
                            return (
                              <motion.button
                                key={prompt.id}
                                type="button"
                                variants={itemVariants}
                                whileHover={{ y: -1.5 }}
                                whileTap={{ scale: 0.995 }}
                                onClick={() => applyMemoryStarter(prompt)}
                                className={`w-full rounded-2xl border p-3 text-left transition ${
                                  active
                                    ? "border-emerald-300 bg-emerald-50/80"
                                    : "border-stone-200 bg-white/70 hover:bg-white"
                                }`}
                              >
                                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Prompt {idx + 1}</p>
                                <p className="mt-1 text-sm text-stone-800">{prompt.question}</p>
                                <p className="mt-2 text-xs text-stone-600">Starter: “{prompt.starter}...”</p>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </>
            )}

            {step === 5 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">Something they always said</motion.h2>
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
                    placeholder="Optional letter mode"
                  />
                </motion.div>
              </>
            )}

            {step === 7 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">What feeling should this song hold?</motion.h2>
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
                  {feelings.map((item) => (
                    <motion.button
                      type="button"
                      key={item}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setForm((f) => ({ ...f, feeling: item }))}
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        form.feeling === item ? "border-stone-800 bg-stone-900 text-white" : "border-stone-200"
                      }`}
                    >
                      {item}
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}

            {step === 8 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">What music feels closest?</motion.h2>
                <motion.div variants={itemVariants} className="space-y-2">
                  {styles.map((item) => (
                    <motion.button
                      type="button"
                      key={item}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setForm((f) => ({ ...f, musicStyle: item }))}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                        form.musicStyle === item ? "border-stone-800 bg-stone-900 text-white" : "border-stone-200"
                      }`}
                    >
                      {item}
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}

            {step === 9 && (
              <>
                <motion.h2 variants={itemVariants} className="font-serif text-3xl text-stone-800">Thank you for sharing their story.</motion.h2>
                <motion.p variants={itemVariants} className="text-sm text-stone-600">
                  We&apos;ll hold this carefully as we prepare your composition. Please add the best email for delivery.
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

      <motion.div className="mt-8 flex items-center justify-between" variants={stepVariants} initial="hidden" animate="show">
        <motion.div variants={itemVariants}>
          <Button type="button" onClick={prev} className="bg-white text-stone-700" disabled={step === 1 || submitting}>
            Back
          </Button>
        </motion.div>
        <motion.div variants={itemVariants}>
          {step < totalSteps ? (
            <Button type="button" onClick={next} disabled={submitting || (step === 3 && !canContinueStep3)}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={submitting || !form.email}>
              {submitting ? "Saving..." : "Continue to checkout"}
            </Button>
          )}
        </motion.div>
      </motion.div>
    </Card>
  );
}
