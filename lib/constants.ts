export const APP_NAME = "Held in Song";

export type TierKey = "SACRED_COMPOSITION" | "VISUAL_TRIBUTE" | "LEGACY_COLLECTION";
export type CollectionKey = "IN_MEMORY" | "IN_LOVE";

export const TIERS: Record<TierKey, { name: string; price: number; description: string }> = {
  SACRED_COMPOSITION: {
    name: "Sacred Composition",
    price: 16900,
    description: "A personal tribute composition with lyrics and reveal page.",
  },
  VISUAL_TRIBUTE: {
    name: "Visual Tribute",
    price: 21900,
    description: "Includes a slideshow video with soft cinematic transitions.",
  },
  LEGACY_COLLECTION: {
    name: "Legacy Collection",
    price: 28900,
    description: "Adds keepsake placeholders and a permanent memory page.",
  },
};

export const ADD_ONS = [
  { key: "extraRevision", name: "Extra revision", price: 2900 },
  { key: "extraVersion", name: "Extra song version", price: 4900 },
  { key: "qrCard", name: "QR keepsake card", price: 4900 },
  { key: "linenPrint", name: "Linen lyric print", price: 3900 },
  { key: "fastDelivery", name: "Fast delivery", price: 1900 },
] as const;

export const FEELING_TO_MUSIC: Record<string, string> = {
  Peace: "soft piano, spacious arrangement, 64-72 BPM, feather-light percussion",
  Gratitude: "warm acoustic texture, intimate vocal tone, gentle cadence",
  Reflection: "minimal ambient layers, restrained dynamics, contemplative phrasing",
  Love: "warm harmonic lift, tender strings or guitar, heartfelt vocal phrasing",
  Release: "slow evolving pads, resolving chord movement, breath-like pacing",
  Hope: "soft piano opening with subtle swell, gentle rise in harmony",
};

export const COMPOSING_ESTIMATE = "Usually within 10-30 minutes. In high-volume periods, up to 12 hours.";

export const COLLECTIONS: Record<
  CollectionKey,
  { title: string; subtitle: string; landingDescription: string; ritualTitle: string }
> = {
  IN_MEMORY: {
    title: "In Memory",
    subtitle: "A gentle tribute for remembrance and healing.",
    landingDescription:
      "A guided path for grief, gratitude, and remembrance. One story. One composition. Held with care.",
    ritualTitle: "In Memory Interview",
  },
  IN_LOVE: {
    title: "In Love",
    subtitle: "A personal composition for love stories and milestones.",
    landingDescription:
      "A modern romantic ritual for anniversaries, vows, and moments that deserve to be held in song.",
    ritualTitle: "In Love Interview",
  },
};
