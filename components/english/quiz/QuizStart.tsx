"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { QuizHistory } from "./QuizHistory";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { getQuizHistory, type QuizSessionResult } from "@/lib/quiz-history";

export type SavedSessionSummary = {
  questionNumber: number;
  total: number;
};

type QuizStartProps = {
  confirmedCount: number;
  dueCount: number;
  questionCount: number;
  /** Unfinished session waiting to be resumed (null when none). */
  saved: SavedSessionSummary | null;
  onStart: () => void;
  onResume: () => void;
  onCancelSaved: () => void;
};

/**
 * Restrained entrance timeline for the landing card: card rises, icon pops,
 * then content items stagger in. Transform/opacity only, scoped with
 * gsap.context (reverted on unmount), skipped under reduced motion.
 * Items carry `data-start-item`; the icon carries `data-start-icon`.
 * (Never tag elements that already have CSS transform transitions.)
 */
function useStartEntrance<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(root, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 });
      tl.fromTo(
        "[data-start-icon]",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)" },
        "-=0.25",
      );
      tl.fromTo(
        "[data-start-item]",
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.08,
          clearProps: "transform,opacity",
        },
        "-=0.3",
      );
    }, root);
    return () => ctx.revert();
  }, [reduceMotion]);

  return ref;
}

/**
 * Quiz landing screen: explains the session, shows counts, and starts a
 * new session only when the user presses the start button. When an
 * unfinished session exists, offers resume or cancel. Also lists previous
 * attempts. Nothing starts automatically.
 */
export function QuizStart({
  confirmedCount,
  dueCount,
  questionCount,
  saved,
  onStart,
  onResume,
  onCancelSaved,
}: QuizStartProps) {
  const [history] = useState<QuizSessionResult[]>(() => getQuizHistory());
  const rootRef = useStartEntrance<HTMLDivElement>();

  // Resume mode: minimal — only resume or cancel, no extra buttons or icons.
  if (saved) {
    return (
      <div className="mx-auto mt-6 w-full max-w-2xl">
        <div ref={rootRef} className="card flex flex-col items-center gap-4 p-8 text-center">
          <div data-start-item>
            <h2 className="text-xl font-bold">اختبار غير مكتمل</h2>
            <p className="muted mt-1 text-sm">
              توقفت عند السؤال <span dir="ltr">{saved.questionNumber} / {saved.total}</span>
            </p>
          </div>
          <div data-start-item className="flex w-full max-w-xs items-stretch justify-center gap-2">
            <button
              type="button"
              onClick={onResume}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-6 text-sm font-bold transition-transform active:scale-95"
              style={{ background: "#43A047", color: "#FFFFFF" }}
            >
              إكمال الاختبار
            </button>
            <button
              type="button"
              onClick={onCancelSaved}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-6 text-sm font-bold transition-transform active:scale-95"
              style={{ border: "1px solid #E53935", color: "#E53935" }}
            >
              إلغاء
            </button>
          </div>
        </div>

        <QuizHistory entries={history} />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-2xl">
      <div ref={rootRef} className="card flex flex-col items-center gap-4 p-8 text-center">
        <span
          data-start-icon
          aria-hidden="true"
          className="inline-flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "var(--md-sys-color-primary-container)",
            color: "var(--md-sys-color-on-primary-container)",
          }}
        >
          <Play className="h-8 w-8" aria-hidden="true" />
        </span>
        <div data-start-item>
          <h2 className="text-xl font-bold">جاهز للاختبار؟</h2>
          <p className="muted mt-1 text-sm">
            {questionCount} أسئلة من كلماتك المؤكدة — الكلمات المتأخرة والخاطئة تظهر أولاً.
          </p>
        </div>

        <div data-start-item className="flex flex-wrap items-center justify-center gap-2" role="status" aria-label="معلومات الجلسة">
          <span
            className="tag"
            style={{ background: "var(--md-sys-color-surface-container-high)", color: "var(--card-ink)" }}
          >
            كلمات مؤكدة: <span dir="ltr">{confirmedCount}</span>
          </span>
          <span
            className="tag"
            style={{ background: "var(--notion-peach)", color: "var(--accent-orange)" }}
          >
            مستحقة للمراجعة: <span dir="ltr">{dueCount}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="inline-flex min-h-12 items-center gap-2 rounded-full px-8 text-base font-bold transition-transform active:scale-95"
          style={{
            background: "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)",
          }}
        >
          <Play className="h-5 w-5" aria-hidden="true" />
          ابدأ الاختبار
        </button>
      </div>

      <QuizHistory entries={history} />
    </div>
  );
}
