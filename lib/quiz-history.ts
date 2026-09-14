"use client";

import { QUIZ_HISTORY_LIMIT } from "./quiz-config";
import type { ScoreTierId } from "./quiz-grade";

/**
 * Quiz session-result history. Stored under its own key
 * (`english-quiz-history-v1`), separate from per-word SM-2 progress and
 * from every existing `progress-v1:*` key. One entry per finished session.
 */
export const QUIZ_HISTORY_KEY = "english-quiz-history-v1";

export type QuizSessionResult = {
  /** Unique id: `${completed_at}-${random}`. */
  id: string;
  /** ISO timestamp of when the session finished. */
  completed_at: string;
  total: number;
  correct: number;
  incorrect: number;
  /** 0–100 percentage. */
  pct: number;
  tier: ScoreTierId;
};

const TIERS: ScoreTierId[] = ["bad", "average", "fair", "excellent"];

function isValidResult(value: unknown): value is QuizSessionResult {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    r.id !== "" &&
    typeof r.completed_at === "string" &&
    Number.isFinite(Date.parse(r.completed_at)) &&
    Number.isInteger(r.total) &&
    (r.total as number) >= 0 &&
    Number.isInteger(r.correct) &&
    (r.correct as number) >= 0 &&
    Number.isInteger(r.incorrect) &&
    (r.incorrect as number) >= 0 &&
    typeof r.pct === "number" &&
    (r.pct as number) >= 0 &&
    (r.pct as number) <= 100 &&
    typeof r.tier === "string" &&
    (TIERS as string[]).includes(r.tier as string)
  );
}

/** All saved session results, newest first (empty on server). */
export function getQuizHistory(): QuizSessionResult[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(QUIZ_HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidResult).sort((a, b) => (a.completed_at < b.completed_at ? 1 : -1));
  } catch {
    return [];
  }
}

function persist(all: QuizSessionResult[]): void {
  try {
    window.localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable — session result is simply not kept.
  }
}

/** Build a result entry for a finished session (not yet saved). */
export function buildQuizResult(
  total: number,
  correct: number,
  tier: ScoreTierId,
): QuizSessionResult {
  const completed_at = new Date().toISOString();
  return {
    id: `${completed_at}-${Math.random().toString(36).slice(2, 8)}`,
    completed_at,
    total,
    correct,
    incorrect: Math.max(0, total - correct),
    pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    tier,
  };
}

/**
 * Append one finished-session result (newest first, capped). Returns the
 * updated history.
 */
export function saveQuizResult(result: QuizSessionResult): QuizSessionResult[] {
  if (typeof window === "undefined") return [];
  const all = [result, ...getQuizHistory()].slice(0, QUIZ_HISTORY_LIMIT);
  persist(all);
  return all;
}
