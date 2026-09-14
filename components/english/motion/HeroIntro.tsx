"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "../hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hero entrance timeline (eyebrow → title → subtitle → CTA) plus a subtle
 * scroll parallax on the decorative orbs. Transform/opacity only.
 */
export function HeroIntro({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion || !ref.current) return;
      const ctx = gsap.context(() => {
        gsap.timeline({ defaults: { ease: "power3.out" } }).from(
          "[data-hero]",
          { y: 28, opacity: 0, duration: 0.7, stagger: 0.12 },
        );
        gsap.utils.toArray<HTMLElement>("[data-orb]").forEach((orb, i) => {
          gsap.to(orb, {
            yPercent: i % 2 === 0 ? 30 : -25,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: 0.6 },
          });
        });
      }, ref);
      return () => ctx.revert();
    },
    { scope: ref, dependencies: [reduceMotion] },
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ borderBottom: "1px solid var(--md-sys-color-outline-variant)" }}
    >
      <div
        data-orb
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 end-[-6rem] h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--md-sys-color-primary)" }}
      />
      <div
        data-orb
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-7rem] start-[-5rem] h-64 w-64 rounded-full opacity-15 blur-3xl"
        style={{ background: "var(--notion-lavender)" }}
      />
      {children}
    </section>
  );
}
