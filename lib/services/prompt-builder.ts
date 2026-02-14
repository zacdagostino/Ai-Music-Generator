import { FEELING_TO_MUSIC } from "@/lib/constants";
import { type RitualAnswers } from "@/lib/schemas";

export interface PromptPack {
  sunoPrompt: string;
  lyricGuide: string;
  qualityRubric: string;
}

export function buildPromptPack(answers: RitualAnswers): PromptPack {
  const feelingMap = FEELING_TO_MUSIC[answers.feeling] ?? FEELING_TO_MUSIC.Reflection;
  const refrain = answers.alwaysSaid?.trim();
  const letterCore = answers.letterMode?.trim()
    ? `Emotional core from personal letter (paraphrase with care): ${answers.letterMode.trim()}`
    : "Emotional core: gratitude and remembrance without heavy dramatization.";

  const sunoPrompt = [
    "Compose a gentle tribute song for remembrance.",
    `Style direction: ${answers.musicStyle}; ${feelingMap}.`,
    "Vocal tone: tender, reverent, human, with soft dynamics.",
    `Person honored: ${answers.honoreeName}. Relationship: ${answers.relationshipType}.`,
    `Descriptors: ${answers.descriptors.join(", ")}.`,
    `Imagery seed: ${answers.vividMemory}.`,
    refrain ? `Refrain suggestion inspired by familiar phrase: ${refrain}.` : "Refrain should feel intimate and simple.",
    "Safety constraints: respectful, non-graphic, non-sensational language.",
  ].join(" ");

  const lyricGuide = [
    "Theme: loving remembrance and emotional steadiness.",
    `Core memory image: ${answers.vividMemory}.`,
    letterCore,
    refrain ? `Use phrase motif as a recurring gentle hook: ${refrain}.` : "Use a short recurring phrase that implies closeness.",
    "Structure: Verse 1 (memory), Verse 2 (gratitude), Chorus (ongoing bond), Bridge (release/hope), final soft chorus.",
  ].join("\n");

  const qualityRubric = [
    "Score each candidate 1-10 in four dimensions:",
    "1) Emotional fidelity to the story and relationship",
    "2) Clarity and warmth of melody/vocal phrasing",
    "3) Lyric specificity and respectful tone",
    "4) Cohesion between mood, instrumentation, and pacing",
    "Select highest total score; break ties by emotional fidelity.",
  ].join("\n");

  return { sunoPrompt, lyricGuide, qualityRubric };
}
