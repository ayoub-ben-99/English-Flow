/** Latest answer outcome for a word. */
export type QuizResult = "correct" | "incorrect";

/** A user answer before it is evaluated. */
export type AnswerResult = QuizResult;

/** Spaced-repetition state for one confirmed word (quiz-only storage). */
export type QuizWordProgress = {
  word_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  /** ISO date (YYYY-MM-DD, UTC) when the word becomes due again. */
  next_review_at: string;
  last_result: QuizResult | null;
  wrong_count: number;
};

/** Minimal word shape the quiz needs (mapped from FinalWord). */
export type QuizWord = {
  id: string;
  english: string;
  arabic: string;
  category: string;
};

/** One multiple-choice option. */
export type QuizOption = {
  /** Source word id (equals the question word id for the correct option). */
  wordId: string;
  /** Arabic label shown on the button. */
  label: string;
};

/** One quiz question with its shuffled options. */
export type QuizQuestion = {
  wordId: string;
  english: string;
  category: string;
  correctArabic: string;
  options: QuizOption[];
};

/** Outcome of a single answered question. */
export type QuizAnswer = {
  question: QuizQuestion;
  pickedWordId: string;
  result: QuizResult;
};

/** Full session state tracked by the quiz runner. */
export type QuizSession = {
  questions: QuizQuestion[];
  currentIndex: number;
  /** Picked option id for the current question (null while unanswered). */
  selectedWordId: string | null;
  answers: QuizAnswer[];
  completed: boolean;
};

export function quizScore(session: QuizSession): {
  correct: number;
  incorrect: number;
  total: number;
} {
  const correct = session.answers.filter((a) => a.result === "correct").length;
  return { correct, incorrect: session.answers.length - correct, total: session.questions.length };
}
