import { QUIZ_OPTIONS_COUNT } from "./quiz-config";
import type { QuizOption, QuizWord } from "./quiz-types";

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/**
 * Build the 4 multiple-choice options for one word. Prefers distractors
 * from the same category, filling up from other categories when needed.
 * Never duplicates the correct answer (by id or by label) or any label.
 */
export function buildQuizOptions(current: QuizWord, pool: QuizWord[]): QuizOption[] {
  const wanted = QUIZ_OPTIONS_COUNT - 1;
  const candidates = pool.filter(
    (w) => w.id !== current.id && w.arabic.trim() !== "" && w.arabic !== current.arabic,
  );

  const sameCategory = shuffled(candidates.filter((w) => w.category === current.category));
  const others = shuffled(candidates.filter((w) => w.category !== current.category));

  const picked: QuizWord[] = [];
  const usedLabels = new Set<string>([current.arabic]);
  for (const group of [sameCategory, others]) {
    for (const word of group) {
      if (picked.length >= wanted) break;
      if (usedLabels.has(word.arabic)) continue;
      usedLabels.add(word.arabic);
      picked.push(word);
    }
    if (picked.length >= wanted) break;
  }

  return shuffled([
    { wordId: current.id, label: current.arabic },
    ...picked.map((w) => ({ wordId: w.id, label: w.arabic })),
  ]);
}
