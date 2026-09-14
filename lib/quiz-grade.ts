/**
 * Result grading for the quiz score screen. Four tiers in the exact solid
 * colors the user asked for — no blending, no pastel tints:
 * - bad: solid red
 * - average: solid orange
 * - fair: solid yellow (with dark text for readability)
 * - excellent: solid green
 */

export type ScoreTierId = "bad" | "average" | "fair" | "excellent";

export type ScoreTier = {
  id: ScoreTierId;
  /** Arabic tier label shown on the chip. */
  label: string;
  /** Encouraging message for this tier. */
  message: string;
  /** Solid tier color for the ring and chip background. */
  color: string;
  /** Text color on top of the solid chip background. */
  onColor: string;
};

const TIERS: Record<ScoreTierId, ScoreTier> = {
  bad: {
    id: "bad",
    label: "يحتاج مراجعة",
    message: "لا بأس — راجع مفرداتك المؤكدة ثم حاول مجدداً.",
    color: "#E53935",
    onColor: "#FFFFFF",
  },
  average: {
    id: "average",
    label: "متوسط",
    message: "بداية طيبة — الكلمات الخاطئة ستعود للمراجعة قريباً.",
    color: "#FB8C00",
    onColor: "#FFFFFF",
  },
  fair: {
    id: "fair",
    label: "جيد",
    message: "أداء جيد! القليل من المراجعة وتصل للامتياز.",
    color: "#FBC02D",
    onColor: "#1A1A1A",
  },
  excellent: {
    id: "excellent",
    label: "ممتاز",
    message: "ممتاز! حفظ كامل — واصل التقدم.",
    color: "#43A047",
    onColor: "#FFFFFF",
  },
};

/** Tier for a 0–100 percentage score. */
export function scoreTierFor(pct: number): ScoreTier {
  if (pct >= 90) return TIERS.excellent;
  if (pct >= 70) return TIERS.fair;
  if (pct >= 40) return TIERS.average;
  return TIERS.bad;
}
