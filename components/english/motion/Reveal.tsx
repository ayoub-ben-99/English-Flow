"use client";

import { useRef } from "react";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Small stagger offset in seconds (e.g. (index % columns) * 0.06). */
  delay?: number;
  /** Optional item identity for progress filtering (data attributes). */
  itemId?: string;
  itemSection?: string;
};

/**
 * Subtle scroll entrance for list items: fade + 16px rise, played once.
 * - transform/opacity only (no layout thrash)
 * - disabled entirely under prefers-reduced-motion
 * - SSR-safe: markup renders visible; hiding applies only post-hydration
 *   to below-the-fold items, so content can never get stuck hidden
 */
export function Reveal({ children, className, delay = 0, itemId, itemSection }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useRevealOnScroll(ref, { delay });

  return (
    <div
      ref={ref}
      className={className}
      data-item-id={itemId}
      data-section={itemSection}
    >
      {children}
    </div>
  );
}
