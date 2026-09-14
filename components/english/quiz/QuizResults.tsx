"use client";

import { Check, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { QuizCollapsible } from "./QuizCollapsible";
import { QuizHistory } from "./QuizHistory";
import { ScoreRing } from "./ScoreRing";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { scoreTierFor } from "@/lib/quiz-grade";
import { getQuizHistory, type QuizSessionResult } from "@/lib/quiz-history";
import type { QuizAnswer } from "@/lib/quiz-types";

type QuizResultsProps = {
  answers: QuizAnswer[];
  onRestart: () => void;
};

/**
 * Final score screen: animated tier-colored ring (red / orange / yellow /
 * green), count-up percentage, stat pills, actions, and a staggered
 * per-question review list. Instant without motion when reduced motion is
 * preferred.
 */
export function QuizResults({ answers, onRestart }: QuizResultsProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const correct = answers.filter((a) => a.result === "correct").length;
  const total = answers.length;
  const incorrect = total - correct;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const tier = scoreTierFor(pct);
  // Saved history (includes the session that just finished).
  const [history] = useState<QuizSessionResult[]>(() => getQuizHistory());

  // Entrance: card rises in. Review rows animate via the shared
  // QuizCollapsible (same function as quiz history).
  useEffect(() => {
    if (reduceMotion) return;
    const card = cardRef.current;
    if (!card) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      );
    });
    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <div>
      <div ref={cardRef} className="card flex flex-col items-center gap-4 p-8 text-center">
        <ScoreRing pct={pct} color={tier.color} label={`نتيجة الاختبار ${pct} بالمئة — ${tier.label}`} />

        <div className="flex flex-col items-center gap-2">
          <span
            className="tag"
            style={{ color: tier.color, fontSize: 15 }}
            aria-live="polite"
          >
            {tier.label} — <span dir="ltr">{correct} / {total}</span>
          </span>
          <p className="card-ink max-w-sm text-sm font-medium">{tier.message}</p>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-bold transition-transform active:scale-95"
            style={{
              background: "var(--md-sys-color-primary)",
              color: "var(--md-sys-color-on-primary)",
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            إعادة الاختبار
          </button>
          <Link
            href="/english/terms"
            className="inline-flex min-h-11 items-center rounded-full px-6 text-sm font-medium transition-transform active:scale-95"
            style={{
              border: "1px solid var(--md-sys-color-outline-variant)",
              color: "var(--muted)",
            }}
          >
            العودة للمفردات
          </Link>
        </div>
      </div>

      {answers.length > 0 ? (
        <QuizCollapsible
          title="مراجعة الأسئلة"
          count={answers.length}
          defaultOpen={true}
          extra={
            <div className="inline-flex items-center" role="status" aria-label="تفاصيل النتيجة">
              <span
                className="tag text-green-500  rounded-full"
              >
                صحيحة: <span dir="ltr">{correct}</span>
              </span>
              <span
                className="tag text-red-500  rounded-full"
              >
                خاطئة: <span dir="ltr">{incorrect}</span>
              </span>
            </div>
          }
        >
          <ul className="flex flex-col gap-2">
            {answers.map(({ question, pickedWordId, result }) => {
              const ok = result === "correct";
              const picked = question.options.find((o) => o.wordId === pickedWordId);
              return (
                <li
                  key={question.wordId}
                  data-collapse-item
                  className={`flex card items-center justify-between gap-3 p-4 ${ok ? "bg-green-500/10! text-green-500 " : "bg-red-500/10! text-red-500"}`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold" dir="ltr" lang="en">
                      {question.english}
                    </p>
                    <p className="card-ink mt-0.5 truncate text-sm">
                      الصحيحة: {question.correctArabic}
                      {!ok && picked ? ` — إجابتك: ${picked.label}` : ""}
                    </p>
                  </div>
                  <span
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-bold"
                    style={{ color: ok ? "#43A047" : "#E53935" }}
                  >
                    {ok ? (
                      <Check className="h-5 w-5" aria-hidden="true" strokeWidth={3} />
                    ) : (
                      <X className="h-5 w-5" aria-hidden="true" strokeWidth={3} />
                    )}
                    {ok ? "صح" : "خطأ"}
                  </span>
                </li>
              );
            })}
          </ul>
        </QuizCollapsible>
      ) : null}

      <QuizHistory entries={history} />
    </div>
  );
}
