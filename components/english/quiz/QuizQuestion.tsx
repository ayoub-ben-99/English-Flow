"use client";

import { Check, X } from "lucide-react";
import type { QuizQuestion as QuizQuestionType } from "@/lib/quiz-types";

type QuizQuestionProps = {
  question: QuizQuestionType;
  questionNumber: number;
  total: number;
  /** Picked option word id (null while unanswered). */
  selectedWordId: string | null;
  onSelect: (wordId: string) => void;
  onNext: () => void;
};

function optionStyle(state: "idle" | "correct" | "wrong" | "dimmed"): React.CSSProperties {
  switch (state) {
    case "correct":
      return {
        background: "var(--notion-mint)",
        color: "var(--tag-green-ink)",
        border: "2px solid var(--tag-green-ink)",
        fontWeight: 700,
      };
    case "wrong":
      return {
        background: "var(--notion-rose)",
        color: "var(--danger)",
        border: "2px solid var(--danger)",
        fontWeight: 700,
      };
    case "dimmed":
      return {
        background: "transparent",
        color: "var(--muted)",
        border: "1px solid var(--md-sys-color-outline-variant)",
        opacity: 0.6,
      };
    case "idle":
    default:
      return {
        background: "transparent",
        color: "var(--card-ink)",
        border: "1px solid var(--md-sys-color-outline-variant)",
      };
  }
}

/** One vocabulary question: English prompt + 4 Arabic answer buttons. */
export function QuizQuestion({
  question,
  questionNumber,
  total,
  selectedWordId,
  onSelect,
  onNext,
}: QuizQuestionProps) {
  const answered = selectedWordId !== null;
  const wasCorrect = selectedWordId === question.wordId;
  const isLast = questionNumber === total;

  return (
    <div>
      <p className="muted text-sm">
        ما معنى هذه الكلمة؟
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight" dir="ltr" lang="en">
        {question.english}
      </h2>

      <div
        className="mt-6 flex flex-col gap-3"
        role="group"
        aria-label={`خيارات السؤال ${questionNumber}`}
      >
        {question.options.map((option) => {
          const isPicked = option.wordId === selectedWordId;
          const isCorrect = option.wordId === question.wordId;
          const state = !answered ? "idle" : isCorrect ? "correct" : isPicked ? "wrong" : "dimmed";
          return (
            <button
              key={option.wordId}
              type="button"
              disabled={answered}
              onClick={() => onSelect(option.wordId)}
              aria-pressed={answered ? isPicked : undefined}
              aria-label={
                answered && isCorrect
                  ? `${option.label} (الإجابة الصحيحة)`
                  : answered && isPicked
                    ? `${option.label} (إجابتك — خاطئة)`
                    : option.label
              }
              style={optionStyle(state)}
              className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-5 py-3 text-lg transition-colors disabled:cursor-default"
            >
              <span>{option.label}</span>
              {answered && isCorrect ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold">
                  <Check className="h-5 w-5" aria-hidden="true" strokeWidth={3} />
                  <span className="hidden sm:inline">صحيحة</span>
                </span>
              ) : null}
              {answered && isPicked && !isCorrect ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold">
                  <X className="h-5 w-5" aria-hidden="true" strokeWidth={3} />
                  <span className="hidden sm:inline">خاطئة</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {answered ? (
          <div
            className=" mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm font-semibold">
              {wasCorrect ? (
                <span style={{ color: "var(--tag-green-ink)" }}>
                  أحسنت! إجابة صحيحة.
                </span>
              ) : (
                <span style={{ color: "var(--danger)" }}>
                  إجابة خاطئة — الصحيحة: {question.correctArabic}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={onNext}
              autoFocus
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-6 text-sm font-bold"
              style={{
                background: "var(--md-sys-color-primary)",
                color: "var(--md-sys-color-on-primary)",
              }}
            >
              {isLast ? "عرض النتيجة" : "السؤال التالي"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
