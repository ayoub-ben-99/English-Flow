"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

const SIZE = 200;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ScoreRingProps = {
  /** 0–100 score. */
  pct: number;
  /** Ring ink color (CSS var from the score tier). */
  color: string;
  /** Accessible label for the progress role. */
  label: string;
};

/**
 * Animated determinate circular progress (MD3-style): the arc draws from
 * empty to the score while the number counts up. Instant under
 * prefers-reduced-motion.
 */
export function ScoreRing({ pct, color, label }: ScoreRingProps) {
  const arcRef = useRef<SVGCircleElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const target = Math.min(100, Math.max(0, Math.round(pct)));

  useEffect(() => {
    const arc = arcRef.current;
    const num = numRef.current;
    if (!arc || !num) return;
    const offset = CIRCUMFERENCE * (1 - target / 100);
    if (reduceMotion) {
      gsap.set(arc, { strokeDashoffset: offset });
      num.textContent = `${target}%`;
      return;
    }
    gsap.set(arc, { strokeDashoffset: CIRCUMFERENCE });
    num.textContent = "0%";
    const counter = { value: 0 };
    const tween = gsap.to(counter, {
      value: target,
      duration: 1.4,
      ease: "power3.out",
      onUpdate: () => {
        num.textContent = `${Math.round(counter.value)}%`;
      },
    });
    const draw = gsap.to(arc, {
      strokeDashoffset: offset,
      duration: 1.4,
      ease: "power3.out",
    });
    return () => {
      tween.kill();
      draw.kill();
    };
  }, [target, reduceMotion]);

  return (
    <div
      className="relative shrink-0"
      style={{ width: SIZE, height: SIZE }}
      role="progressbar"
      aria-valuenow={target}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--md-sys-color-surface-container-high)"
          strokeWidth={STROKE}
        />
        <circle
          ref={arcRef}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span
          ref={numRef}
          className="text-4xl font-bold tabular-nums"
          dir="ltr"
          aria-hidden="true"
        >
          0%
        </span>
      </div>
    </div>
  );
}
