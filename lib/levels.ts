/** Shared CEFR level constants (no Node APIs — safe for client import). */
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];
export const LEVEL_OPTIONS = CEFR_LEVELS.map((id) => ({
  id,
  arabic: id,
  english: id,
}));
