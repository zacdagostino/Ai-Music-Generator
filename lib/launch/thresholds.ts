export const LAUNCH_THRESHOLDS = {
  targetOrdersIn30Days: 10,
  targetAovCents: 20000,
  targetPhysicalAttachRate: 0.3,
  targetCollectionCoverage: 2,
} as const;

export const STOP_GO_RULES = [
  "Go: AOV >= $200 and CAC proxy <= $60 by day 14.",
  "Hold: Purchases < 3 after $250 spend; iterate landing copy and creative angle.",
  "Stop channel test: CTR < 0.8% for 5 consecutive days on a creative set.",
];

export const WEEKLY_REVIEW_CADENCE = [
  "Monday: ad performance + spend allocation review",
  "Wednesday: funnel drop-off + checkout friction review",
  "Friday: testimonial/feedback synthesis + next experiment lock",
];
