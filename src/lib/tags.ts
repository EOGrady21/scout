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

export const MAP_FILTER_TAGS = ["kid-friendly", "off-leash"] as const;

export type MapFilterTag = (typeof MAP_FILTER_TAGS)[number];
