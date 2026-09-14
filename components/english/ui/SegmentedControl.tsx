"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

export type SegmentedItem<Id extends string> = {
  id: Id;
  /** Accessible label for the option. */
  label: string;
  /** Visible content (text or icon). */
  content: React.ReactNode;
  /** Native tooltip (optional). */
  title?: string;
};

type SegmentedControlProps<Id extends string> = {
  items: SegmentedItem<Id>[];
  value: Id;
  onChange: (next: Id) => void;
  ariaLabel: string;
  /** "md" text buttons or "sm" compact icon buttons. */
  size?: "md" | "sm";
  /** Enable arrow-key navigation (default true). */
  arrowKeys?: boolean;
};

/**
 * Next.js-style segmented control: one joined bar with a single pill that
 * slides to the active option (GSAP x + width). Arrow keys move between
 * options; instant jump under reduced motion. Shared by the progress view
 * switcher and the theme switcher.
 */
export function SegmentedControl<Id extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  size = "md",
  arrowKeys = true,
}: SegmentedControlProps<Id>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRunRef = useRef(true);
  const reduceMotion = useReducedMotion();
  const activeIndex = Math.max(
    0,
    items.findIndex((it) => it.id === value),
  );

  useEffect(() => {
    const pill = pillRef.current;
    const btn = btnRefs.current[activeIndex];
    if (!pill || !btn) return;
    let cancelled = false;
    const place = (animate: boolean) => {
      if (cancelled) return;
      if (!animate || reduceMotion) {
        gsap.set(pill, { x: btn.offsetLeft, width: btn.offsetWidth });
      } else {
        gsap.to(pill, {
          x: btn.offsetLeft,
          width: btn.offsetWidth,
          duration: 0.35,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    };
    place(!firstRunRef.current);
    firstRunRef.current = false;
    const onResize = () => place(false);
    window.addEventListener("resize", onResize);
    const fonts = document.fonts;
    if (fonts) {
      void fonts.ready.then(() => place(false));
    }
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [activeIndex, reduceMotion]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const rtl =
      containerRef.current !== null &&
      getComputedStyle(containerRef.current).direction === "rtl";
    const delta =
      event.key === "ArrowRight" ? (rtl ? -1 : 1) : rtl ? 1 : -1;
    const next = (activeIndex + delta + items.length) % items.length;
    const target = items[next];
    if (target) {
      onChange(target.id);
      btnRefs.current[next]?.focus();
    }
  }

  const md = size !== "sm";

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={ariaLabel}
      onKeyDown={arrowKeys ? onKeyDown : undefined}
      className={
        md
          ? "relative flex w-full gap-1 self-start rounded-full p-1 sm:w-auto"
          : "relative inline-flex shrink-0 gap-1 rounded-full p-1"
      }
      style={{ background: "var(--md-sys-color-surface-container-high)" }}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-0 rounded-full"
        style={{ background: "var(--md-sys-color-primary)", width: 0 }}
      />
      {items.map((it, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={it.id}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            onClick={() => onChange(it.id)}
            aria-pressed={isActive}
            aria-label={it.label}
            title={it.title}
            className={
              md
                ? "relative z-10 min-h-11 flex-1 rounded-full px-5 text-sm motion-safe:transition-colors motion-safe:duration-200 sm:flex-none"
                : "relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full motion-safe:transition-colors motion-safe:duration-200"
            }
            style={{
              background: "transparent",
              color: isActive ? "var(--md-sys-color-on-primary)" : "var(--muted)",
              fontWeight: isActive ? 700 : 500,
            }}
          >
            {it.content}
          </button>
        );
      })}
    </div>
  );
}
