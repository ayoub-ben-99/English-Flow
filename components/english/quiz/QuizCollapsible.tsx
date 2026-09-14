"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

type QuizCollapsibleProps = {
  /** Section title shown on the header button. */
  title: string;
  /** Number badge shown next to the title. */
  count: number;
  /** Whether the section starts expanded. */
  defaultOpen?: boolean;
  /** Optional extra content in the header (e.g. stat tags). */
  extra?: React.ReactNode;
  /** List content; items to animate carry `data-collapse-item`. */
  children: React.ReactNode;
};

/**
 * Shared collapsible section (same function for quiz history and question
 * review): header button with a rotating chevron, smooth height collapse
 * via the project's `cat-panel` pattern, and a GSAP stagger for the items
 * on every open. Content never unmounts. Instant without motion when
 * reduced motion is preferred.
 */
export function QuizCollapsible({ title, count, defaultOpen = false, extra, children }: QuizCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const innerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || reduceMotion) return;
    const items = innerRef.current?.querySelectorAll("[data-collapse-item]");
    if (!items || items.length === 0) return;
    const tween = gsap.fromTo(
      items,
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
        stagger: 0.06,
        overwrite: "auto",
        clearProps: "transform,opacity",
      },
    );
    return () => {
      tween.kill();
    };
  }, [open, reduceMotion]);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-11 w-full items-center justify-between gap-2"
      >
        <span className="text-lg font-semibold">{title}</span>
        <span className="flex shrink-0 items-center gap-2">
          {extra}
          <span
            className="tag"
            dir="ltr"
            style={{
              background: "var(--md-sys-color-surface-container-high)",
              color: "var(--card-ink)",
            }}
          >
            {count}
          </span>
          <ChevronDown
            className="h-5 w-5 transition-transform duration-200"
            aria-hidden="true"
            style={{ transform: open ? "rotate(180deg)" : "none", color: "var(--muted)" }}
          />
        </span>
      </button>
      <div id={panelId} className={`cat-panel${open ? " cat-open" : ""}`}>
        <div ref={innerRef} className="cat-panel-inner">
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
