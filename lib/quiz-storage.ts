"use client";

import { isIsoDate, todayUtcDate } from "./quiz-dates";
import { initialQuizProgress } from "./quiz-sm2";
import type { QuizWordProgress } from "./quiz-types";

/**
 * Quiz-specific progress storage. Completely separate from the existing
 * `progress-v1:*` keys in lib/progress.ts — this module never reads or
 * writes those keys. All quiz localStorage access goes through here.
 */
export const QUIZ_STORAGE_KEY = "english-quiz-progress-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidProgress(value: unknown): value is QuizWordProgress {
  if (!isRecord(value)) return false;
  return (
    typeof value.word_id === "string" &&
    typeof value.ease_factor === "number" &&
    Number.isFinite(value.ease_factor) &&
    typeof value.interval_days === "number" &&
    Number.isFinite(value.interval_days) &&
    typeof value.repetitions === "number" &&
    Number.isFinite(value.repetitions) &&
    isIsoDate(value.next_review_at) &&
    (value.last_result === null || value.last_result === "correct" || value.last_result === "incorrect") &&
    typeof value.wrong_count === "number" &&
    Number.isFinite(value.wrong_count)
  );
}

function readRaw(): Record<string, unknown> {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** All stored quiz progress (invalid entries are dropped). */
export function getQuizProgress(): Record<string, QuizWordProgress> {
  const raw = readRaw();
  const out: Record<string, QuizWordProgress> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isValidProgress(value) && value.word_id === key) out[key] = value;
  }
  return out;
}

/** Progress for one word, or null when not tracked yet. */
export function getWordProgress(wordId: string): QuizWordProgress | null {
  return getQuizProgress()[wordId] ?? null;
}

function persist(all: Record<string, QuizWordProgress>): void {
  try {
    window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable — quiz still works for this session.
  }
}

/** Insert or replace the progress for one word. */
export function saveWordProgress(progress: QuizWordProgress): void {
  if (typeof window === "undefined") return;
  const all = getQuizProgress();
  all[progress.word_id] = progress;
  persist(all);
}

/**
 * Ensure every given word id has progress, initializing missing ones with
 * the default SM-2 state. Returns the full map for those ids.
 */
export function ensureQuizProgress(
  wordIds: string[],
  today: string = todayUtcDate(),
): Record<string, QuizWordProgress> {
  const all = getQuizProgress();
  let added = false;
  for (const id of wordIds) {
    if (!all[id]) {
      all[id] = initialQuizProgress(id, today);
      added = true;
    }
  }
  if (added && typeof window !== "undefined") persist(all);
  const scoped: Record<string, QuizWordProgress> = {};
  for (const id of wordIds) {
    const entry = all[id];
    if (entry) scoped[id] = entry;
  }
  return scoped;
}
