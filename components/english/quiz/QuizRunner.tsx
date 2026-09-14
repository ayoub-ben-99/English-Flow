"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { LogOut } from "lucide-react";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResults } from "./QuizResults";
import { QuizStart, type SavedSessionSummary } from "./QuizStart";
import { EmptyState } from "../ui/EmptyState";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { QUIZ_MIN_WORDS, QUIZ_SESSION_SIZE } from "@/lib/quiz-config";
import { isDue, todayUtcDate } from "@/lib/quiz-dates";
import { scoreTierFor } from "@/lib/quiz-grade";
import { buildQuizResult, saveQuizResult } from "@/lib/quiz-history";
import { isComplete } from "@/lib/progress";
import { buildQuizSession, canBuildQuiz } from "@/lib/quiz-select";
import {
  clearQuizSession,
  getSavedQuizSession,
  saveQuizSessionSnapshot,
  type QuizSavedSession,
} from "@/lib/quiz-session-store";
import { applyQuizResult } from "@/lib/quiz-sm2";
import { ensureQuizProgress, getQuizProgress, saveWordProgress } from "@/lib/quiz-storage";
import type { WordItem } from "@/lib/pipeline-words";
import type { QuizAnswer, QuizQuestion as QuizQuestionType, QuizWord } from "@/lib/quiz-types";

type Phase = "loading" | "error" | "start" | "empty" | "active" | "done";

type QuizState = {
  phase: Phase;
  questions: QuizQuestionType[];
  index: number;
  selectedWordId: string | null;
  answers: QuizAnswer[];
  confirmedCount: number;
  dueCount: number;
  /** Confirmed words loaded for the start screen (session built on demand). */
  words: QuizWord[];
};

const INITIAL_STATE: QuizState = {
  phase: "loading",
  questions: [],
  index: 0,
  selectedWordId: null,
  answers: [],
  confirmedCount: 0,
  dueCount: 0,
  words: [],
};

function toQuizWord(item: WordItem): QuizWord {
  return {
    id: item.word.sourceId,
    english: item.word.word,
    arabic: item.word.translation,
    category: item.word.category,
  };
}

/**
 * Quiz session runner: loads all words, keeps only confirmed ones (using
 * the exact existing `isComplete("terms", id)` condition), builds a
 * due-first session, and persists SM-2 updates to quiz-only storage.
 */
export function QuizRunner() {
  const [state, setState] = useState<QuizState>(INITIAL_STATE);
  const [runId, setRunId] = useState(0);
  /** Unfinished session snapshot (for resume/cancel on the start screen). */
  const [savedSession, setSavedSession] = useState<QuizSavedSession | null>(() =>
    getSavedQuizSession(),
  );
  const cardRef = useRef<HTMLDivElement>(null);
  /** Guards against double-processing one question (updaters must stay pure). */
  const answeredRef = useRef<string | null>(null);
  /** Ensures the finished-session result is saved exactly once. */
  const historySavedRef = useRef(false);
  /** When true, the loader builds a session immediately (restart button). */
  const autoStartRef = useRef(false);
  const reduceMotion = useReducedMotion();

  // Same deferred-fetch pattern as ProgressFilteredList: state updates only
  // happen in promise callbacks, never synchronously in the effect body.
  // Fresh mounts (open, refresh, return) always land on the start screen —
  // a session only begins via the start/restart buttons.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/english/terms")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load words");
        return res.json() as Promise<{ items: WordItem[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        const confirmed = data.items
          .map(toQuizWord)
          .filter((w) => isComplete("terms", w.id) && w.arabic.trim() !== "");
        if (!canBuildQuiz(confirmed.length)) {
          setState({ ...INITIAL_STATE, phase: "empty", confirmedCount: confirmed.length });
          return;
        }
        const today = todayUtcDate();
        const progress = getQuizProgress();
        const dueCount = confirmed.filter(
          (w) => !progress[w.id] || isDue(progress[w.id].next_review_at, today),
        ).length;
        if (autoStartRef.current) {
          autoStartRef.current = false;
          startSession(confirmed);
          return;
        }
        setState({
          ...INITIAL_STATE,
          phase: "start",
          confirmedCount: confirmed.length,
          dueCount,
          words: confirmed,
        });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, phase: "error" }));
      });
    return () => {
      cancelled = true;
    };
  }, [runId]);

  /** Continuously snapshot the active session so exit/refresh can resume it. */
  useEffect(() => {
    if (state.phase !== "active") return;
    saveQuizSessionSnapshot({
      questions: state.questions,
      currentIndex: state.index,
      selectedWordId: state.selectedWordId,
      answers: state.answers,
      confirmedCount: state.confirmedCount,
      dueCount: state.dueCount,
      words: state.words,
      saved_at: new Date().toISOString(),
    });
  }, [state]);

  /** Build a due-first session from confirmed words and activate it. */
  function startSession(confirmed: QuizWord[]): void {
    answeredRef.current = null;
    historySavedRef.current = false;
    clearQuizSession();
    setSavedSession(null);
    const today = todayUtcDate();
    const scoped = ensureQuizProgress(
      confirmed.map((w) => w.id),
      today,
    );
    const questions = buildQuizSession(confirmed, scoped, today, QUIZ_SESSION_SIZE);
    const progress = getQuizProgress();
    const dueCount = confirmed.filter(
      (w) => !progress[w.id] || isDue(progress[w.id].next_review_at, today),
    ).length;
    setState({
      phase: "active",
      questions,
      index: 0,
      selectedWordId: null,
      answers: [],
      confirmedCount: confirmed.length,
      dueCount,
      words: confirmed,
    });
  }

  function handleStart(): void {
    if (state.phase !== "start" || state.words.length === 0) return;
    startSession(state.words);
  }

  function handleResume(): void {
    const saved = getSavedQuizSession();
    if (!saved || saved.questions.length === 0) return;
    const index = Math.min(saved.currentIndex, saved.questions.length - 1);
    const question = saved.questions[index];
    answeredRef.current =
      saved.selectedWordId !== null && question ? question.wordId : null;
    historySavedRef.current = false;
    setState({
      phase: "active",
      questions: saved.questions,
      index,
      selectedWordId: saved.selectedWordId,
      answers: saved.answers,
      confirmedCount: saved.confirmedCount,
      dueCount: saved.dueCount,
      words: saved.words,
    });
  }

  function handleCancelSaved(): void {
    clearQuizSession();
    setSavedSession(null);
  }

  /** Exit mid-quiz: progress is already snapshotted, back to the start screen. */
  function handleExit(): void {
    if (state.phase !== "active") return;
    saveQuizSessionSnapshot({
      questions: state.questions,
      currentIndex: state.index,
      selectedWordId: state.selectedWordId,
      answers: state.answers,
      confirmedCount: state.confirmedCount,
      dueCount: state.dueCount,
      words: state.words,
      saved_at: new Date().toISOString(),
    });
    setSavedSession(getSavedQuizSession());
    setState({
      ...INITIAL_STATE,
      phase: "start",
      confirmedCount: state.confirmedCount,
      dueCount: state.dueCount,
      words: state.words,
    });
  }

  // Question transition: fade + slight slide (skipped under reduced motion).
  useEffect(() => {
    const el = cardRef.current;
    if (!el || reduceMotion || state.phase !== "active") return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" },
    );
    return () => {
      gsap.killTweensOf(el);
    };
  }, [state.index, state.phase, reduceMotion]);

  function handleSelect(wordId: string): void {
    if (state.phase !== "active" || state.selectedWordId !== null) return;
    const question = state.questions[state.index];
    if (!question) return;
    if (!question.options.some((o) => o.wordId === wordId)) return;
    // One processing per question even under rapid double-clicks.
    if (answeredRef.current === question.wordId) return;
    answeredRef.current = question.wordId;

    const correct = wordId === question.wordId;
    const card = cardRef.current;

    if (!reduceMotion && card) {
      if (correct) {
        gsap.fromTo(
          card,
          { scale: 1 },
          { scale: 1.01, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" },
        );
      } else {
        gsap.fromTo(
          card,
          { x: 0 },
          {
            keyframes: [{ x: -8 }, { x: 8 }, { x: -5 }, { x: 5 }, { x: 0 }],
            duration: 0.35,
            ease: "power1.out",
            overwrite: "auto",
          },
        );
      }
    }

    // Quiz-only SM-2 persistence (never touches `progress-v1:*` keys).
    const today = todayUtcDate();
    const scoped = ensureQuizProgress([question.wordId], today);
    const current = scoped[question.wordId];
    if (current) {
      saveWordProgress(applyQuizResult(current, correct ? "correct" : "incorrect", today));
    }

    setState({
      ...state,
      selectedWordId: wordId,
      answers: [
        ...state.answers,
        { question, pickedWordId: wordId, result: correct ? "correct" : "incorrect" },
      ],
    });
  }

  function handleNext(): void {
    if (state.phase !== "active" || state.selectedWordId === null) return;
    answeredRef.current = null;
    if (state.index + 1 >= state.questions.length) {
      // Persist the finished-session result once (quiz-only history key)
      // and drop the in-progress snapshot — nothing left to resume.
      if (!historySavedRef.current) {
        historySavedRef.current = true;
        const correct = state.answers.filter((a) => a.result === "correct").length;
        const total = state.questions.length;
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
        saveQuizResult(buildQuizResult(total, correct, scoreTierFor(pct).id));
        clearQuizSession();
        setSavedSession(null);
      }
      setState({ ...state, phase: "done", selectedWordId: null });
      return;
    }
    setState({ ...state, index: state.index + 1, selectedWordId: null });
  }

  function handleRestart(): void {
    answeredRef.current = null;
    historySavedRef.current = false;
    autoStartRef.current = true;
    setState({ ...INITIAL_STATE });
    setRunId((id) => id + 1);
  }

  if (state.phase === "loading") {
    return (
      <div className="mt-6 flex flex-col gap-4" role="status" aria-label="جارٍ تحميل الاختبار">
        <div className="card animate-pulse p-8" style={{ minHeight: 220 }} aria-hidden="true" />
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="mt-6">
        <EmptyState
          title="تعذر تحميل الاختبار"
          hint="تحقق من الاتصال ثم حاول مجدداً."
        />
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex min-h-11 items-center rounded-full px-6 text-sm font-bold"
            style={{
              background: "var(--md-sys-color-primary)",
              color: "var(--md-sys-color-on-primary)",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "empty") {
    return (
      <div className="mt-6">
        <EmptyState
          title="لا توجد كلمات كافية للاختبار"
          hint={`أكّد ${QUIZ_MIN_WORDS} كلمات على الأقل من صفحة المفردات (زر ✓) لبدء الاختبار. لديك الآن ${state.confirmedCount}.`}
        />
        <div className="mt-4 flex justify-center">
          <Link
            href="/english/terms"
            className="inline-flex min-h-11 items-center rounded-full px-6 text-sm font-bold"
            style={{
              background: "var(--md-sys-color-primary)",
              color: "var(--md-sys-color-on-primary)",
            }}
          >
            الذهاب إلى المفردات
          </Link>
        </div>
      </div>
    );
  }

  if (state.phase === "start") {
    const saved: SavedSessionSummary | null = savedSession
      ? {
          questionNumber: Math.min(savedSession.currentIndex, savedSession.questions.length - 1) + 1,
          total: savedSession.questions.length,
        }
      : null;
    return (
      <QuizStart
        confirmedCount={state.confirmedCount}
        dueCount={state.dueCount}
        questionCount={Math.min(QUIZ_SESSION_SIZE, state.confirmedCount)}
        saved={saved}
        onStart={handleStart}
        onResume={handleResume}
        onCancelSaved={handleCancelSaved}
      />
    );
  }

  if (state.phase === "done") {
    return (
      <div className="mx-auto mt-6 w-full max-w-2xl">
        <QuizResults answers={state.answers} onRestart={handleRestart} />
      </div>
    );
  }

  const question = state.questions[state.index];
  if (!question) {
    return (
      <div className="mt-6">
        <EmptyState title="لا توجد أسئلة في هذه الجلسة" hint="أعد تحميل الصفحة للمحاولة مجدداً." />
      </div>
    );
  }

  const answeredCount = state.answers.length;
  const total = state.questions.length;
  const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div className="mx-auto mt-6 w-full max-w-2xl">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium" aria-live="polite" dir="ltr">
          {state.index + 1} / {total}
        </span>
        <span className="muted">السؤال {state.index + 1} من {total}</span>
        <button
          type="button"
          onClick={handleExit}
          aria-label="خروج من الاختبار مع حفظ التقدم"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-transform active:scale-95"
          style={{
            border: "1px solid var(--md-sys-color-outline-variant)",
            color: "var(--muted)",
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          خروج
        </button>
      </div>
      <div
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="تقدم الاختبار"
        className="mt-2 h-2 overflow-hidden rounded-full"
        style={{ background: "var(--md-sys-color-surface-container-high)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: "var(--md-sys-color-primary)" }}
        />
      </div>

      <div ref={cardRef} className="card mt-4 p-5 sm:p-8" key={question.wordId}>
        <QuizQuestion
          question={question}
          questionNumber={state.index + 1}
          total={total}
          selectedWordId={state.selectedWordId}
          onSelect={handleSelect}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
