import { addDaysUtc, todayUtcDate } from "./quiz-dates";
import type { QuizResult, QuizWordProgress } from "./quiz-types";

export const QUIZ_MIN_EASE = 1.3;
export const QUIZ_MAX_EASE = 2.5;
const QUIZ_INITIAL_EASE = 2.5;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Pure simplified SM-2 update: given the current progress and the latest
 * answer result, return the updated progress. No I/O, no side effects.
 */
export function applyQuizResult(
  current: QuizWordProgress,
  result: QuizResult,
  today: string = todayUtcDate(),
): QuizWordProgress {
  if (result === "correct") {
    const repetitions = current.repetitions + 1;
    const interval_days =
      repetitions === 1
        ? 1
        : repetitions === 2
          ? 6
          : Math.max(1, Math.round(current.interval_days * current.ease_factor));
    const ease_factor = Math.min(round1(current.ease_factor + 0.1), QUIZ_MAX_EASE);
    return {
      ...current,
      ease_factor,
      interval_days,
      repetitions,
      next_review_at: addDaysUtc(today, interval_days),
      last_result: "correct",
    };
  }

  const ease_factor = Math.max(round1(current.ease_factor - 0.2), QUIZ_MIN_EASE);
  return {
    ...current,
    ease_factor,
    interval_days: 1,
    repetitions: 0,
    next_review_at: addDaysUtc(today, 1),
    last_result: "incorrect",
    wrong_count: current.wrong_count + 1,
  };
}

/** Initial progress for a newly tracked confirmed word. */
export function initialQuizProgress(wordId: string, today: string = todayUtcDate()): QuizWordProgress {
  return {
    word_id: wordId,
    ease_factor: QUIZ_INITIAL_EASE,
    interval_days: 0,
    repetitions: 0,
    next_review_at: today,
    last_result: null,
    wrong_count: 0,
  };
}
