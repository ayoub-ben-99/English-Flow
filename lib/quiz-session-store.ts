"use client";

import type { QuizAnswer, QuizOption, QuizQuestion, QuizWord } from "./quiz-types";

/**
 * In-progress quiz session persistence. Stored under its own key
 * (`english-quiz-session-v1`), separate from SM-2 progress, result
 * history, and every existing `progress-v1:*` key. Lets the user exit
 * mid-quiz and resume later from the start screen.
 */
export const QUIZ_SESSION_KEY = "english-quiz-session-v1";

export type QuizSavedSession = {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedWordId: string | null;
  answers: QuizAnswer[];
  confirmedCount: number;
  dueCount: number;
  words: QuizWord[];
  /** ISO timestamp of when the snapshot was saved. */
  saved_at: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

function isOption(v: unknown): v is QuizOption {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.wordId === "string" && typeof o.label === "string";
}

function isQuestion(v: unknown): v is QuizQuestion {
  if (typeof v !== "object" || v === null) return false;
  const q = v as Record<string, unknown>;
  if (typeof q.wordId !== "string" || typeof q.english !== "string") return false;
  if (typeof q.category !== "string" || typeof q.correctArabic !== "string") return false;
  if (!Array.isArray(q.options) || q.options.length < 2) return false;
  if (!q.options.every(isOption)) return false;
  if (!q.options.some((o: QuizOption) => o.wordId === q.wordId)) return false;
  return true;
}

function isAnswer(v: unknown): v is QuizAnswer {
  if (typeof v !== "object" || v === null) return false;
  const a = v as Record<string, unknown>;
  if (!isQuestion(a.question)) return false;
  if (typeof a.pickedWordId !== "string") return false;
  return a.result === "correct" || a.result === "incorrect";
}

function isWord(v: unknown): v is QuizWord {
  if (typeof v !== "object" || v === null) return false;
  const w = v as Record<string, unknown>;
  return (
    typeof w.id === "string" &&
    typeof w.english === "string" &&
    typeof w.arabic === "string" &&
    typeof w.category === "string"
  );
}

function isValidSession(value: unknown): value is QuizSavedSession {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  if (!Array.isArray(s.questions) || s.questions.length === 0) return false;
  if (!s.questions.every(isQuestion)) return false;
  if (!Number.isInteger(s.currentIndex)) return false;
  const idx = s.currentIndex as number;
  if (idx < 0 || idx >= (s.questions as unknown[]).length) return false;
  if (s.selectedWordId !== null && typeof s.selectedWordId !== "string") return false;
  if (!Array.isArray(s.answers) || !s.answers.every(isAnswer)) return false;
  if (!Array.isArray(s.words) || !s.words.every(isWord)) return false;
  if (typeof s.confirmedCount !== "number" || typeof s.dueCount !== "number") return false;
  if (!isNonEmptyString(s.saved_at)) return false;
  if (!Number.isFinite(Date.parse(s.saved_at as string))) return false;
  return true;
}

/** Saved in-progress session, or null when none exists (or invalid). */
export function getSavedQuizSession(): QuizSavedSession | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(QUIZ_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Snapshot the current in-progress session (overwrites any previous). */
export function saveQuizSessionSnapshot(session: QuizSavedSession): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable — resume simply won't be offered.
  }
}

/** Discard the saved in-progress session (finish or cancel). */
export function clearQuizSession(): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(QUIZ_SESSION_KEY);
  } catch {
    // Ignore — nothing to clear.
  }
}
