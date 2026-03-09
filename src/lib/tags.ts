export const QUICK_TAGS = [
  "kid-friendly",
  "off-leash",
  "muddy",
  "icy",
  "shaded",
  "crowded",
  "stroller-friendly",
] as const;

export type QuickTag = (typeof QUICK_TAGS)[number];
