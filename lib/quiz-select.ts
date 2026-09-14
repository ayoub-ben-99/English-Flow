import { QUIZ_MIN_WORDS, QUIZ_OPTIONS_COUNT, QUIZ_SESSION_SIZE } from "./quiz-config";
import { isDue, todayUtcDate } from "./quiz-dates";
import { buildQuizOptions } from "./quiz-options";
import type { QuizQuestion, QuizWord, QuizWordProgress } from "./quiz-types";

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/**
 * Select quiz words from confirmed words only. Due words
 * (`next_review_at <= today`) come first, sorted by `wrong_count` DESC;
 * remaining slots are filled randomly from the rest. When nothing is due,
 * the session is a random sample of all confirmed words.
 */
export function selectQuizWords(
  confirmed: QuizWord[],
  progress: Record<string, QuizWordProgress>,
  today: string = todayUtcDate(),
  count: number = QUIZ_SESSION_SIZE,
): QuizWord[] {
  const due = shuffled(confirmed).filter((w) => isDue(progress[w.id]?.next_review_at ?? today, today));
  due.sort((a, b) => (progress[b.id]?.wrong_count ?? 0) - (progress[a.id]?.wrong_count ?? 0));

  if (due.length === 0) return shuffled(confirmed).slice(0, Math.max(0, count));

  const dueIds = new Set(due.map((w) => w.id));
  const rest = shuffled(confirmed.filter((w) => !dueIds.has(w.id)));
  return [...due, ...rest].slice(0, Math.max(0, count));
}

/** Whether enough confirmed words exist for a full 4-option quiz. */
export function canBuildQuiz(confirmedCount: number): boolean {
  return confirmedCount >= Math.max(QUIZ_MIN_WORDS, QUIZ_OPTIONS_COUNT);
}

/**
 * Build a full quiz session: select words, then generate options for each.
 * Words without a usable translation are skipped.
 */
export function buildQuizSession(
  confirmed: QuizWord[],
  progress: Record<string, QuizWordProgress>,
  today: string = todayUtcDate(),
  count: number = QUIZ_SESSION_SIZE,
): QuizQuestion[] {
  const usable = confirmed.filter((w) => w.arabic.trim() !== "");
  const size = Math.min(Math.max(0, count), usable.length);
  return selectQuizWords(usable, progress, today, size).map((word) => ({
    wordId: word.id,
    english: word.english,
    category: word.category,
    correctArabic: word.arabic,
    options: buildQuizOptions(word, usable),
  }));
}
