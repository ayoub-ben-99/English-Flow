"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "./useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Thin scroll-progress bar pinned to the viewport top (guidance, not decor). */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion || !ref.current) return;
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        },
      );
    },
    { dependencies: [reduceMotion] },
  );

  // Always render (invisible at scaleX 0 when reduced motion is on) so
  // server and client markup match during hydration.
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-right"
      style={{ background: "var(--md-sys-color-primary)", transform: "scaleX(0)" }}
    />
  );
}
