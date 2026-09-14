"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";

type RevealOptions = {
  /** Rise distance in px. */
  y?: number;
  /** Tween duration in seconds. */
  duration?: number;
  /** Stagger offset in seconds. */
  delay?: number;
  /** Fraction of the viewport height marking the reveal zone. */
  threshold?: number;
};

/**
 * Scroll-reveal that can never leave content stuck hidden.
 *
 * Why not `gsap.from + ScrollTrigger once`: the `from` tween hides the
 * element immediately (opacity 0) and trusts a cached trigger position.
 * After async layout shifts (fetched lists, fonts, images), mobile
 * viewport resizes, or fast scrolling, that trigger can misfire — leaving
 * the element invisible forever with only the background showing.
 *
 * This hook instead:
 * - never hides elements already in (or above) the reveal zone,
 * - drives the tween with IntersectionObserver, which re-evaluates
 *   automatically on layout shifts and resizes,
 * - force-shows the element after a timeout as a final safety net,
 * - clears inline props after the animation so no styles linger.
 */
export function useRevealOnScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options?: RevealOptions,
): void {
  const reduceMotion = useReducedMotion();
  const y = options?.y ?? 16;
  const duration = options?.duration ?? 0.45;
  const delay = options?.delay ?? 0;
  const zone = options?.threshold ?? 0.92;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    // Already in (or above) the reveal zone → leave visible, nothing to do.
    // Re-running the effect (e.g. delay change) never re-hides content.
    if (el.getBoundingClientRect().top < window.innerHeight * zone) return;

    gsap.set(el, { y, opacity: 0 });
    let settled = false;
    let observer: IntersectionObserver | null = null;
    let safety = 0;
    const settle = (animate: boolean) => {
      if (settled) return;
      settled = true;
      observer?.disconnect();
      window.clearTimeout(safety);
      if (animate) {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration,
          delay,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => gsap.set(el, { clearProps: "transform,opacity" }),
        });
      } else {
        gsap.set(el, { clearProps: "transform,opacity" });
      }
    };
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) settle(true);
      },
      {
        rootMargin: `0px 0px -${Math.round((1 - zone) * 100)}% 0px`,
        threshold: 0,
      },
    );
    observer.observe(el);
    // Final net: never leave content hidden (starved observer, background
    // tab, missed callback) — show instantly without animation.
    safety = window.setTimeout(() => settle(false), 3000);
    return () => {
      observer?.disconnect();
      window.clearTimeout(safety);
      gsap.killTweensOf(el);
      if (!settled) gsap.set(el, { clearProps: "transform,opacity" });
    };
  }, [ref, reduceMotion, y, duration, delay, zone]);
}
