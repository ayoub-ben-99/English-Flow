"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "./useReducedMotion";

if (typeof window !== "undefined") {
  // registerPlugin is idempotent — safe across HMR remounts.
  gsap.registerPlugin(ScrollTrigger);
}

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
 * - SSR-safe: markup renders visible; animation starts post-hydration
 * - useGSAP reverts everything automatically on unmount
 */
export function Reveal({ children, className, delay = 0, itemId, itemSection }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion || !ref.current) return;
      gsap.from(ref.current, {
        y: 16,
        opacity: 0,
        duration: 0.45,
        delay,
        ease: "power2.out",
        overwrite: "auto",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 92%",
          once: true,
        },
      });
    },
    { scope: ref, dependencies: [reduceMotion, delay] },
  );

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
