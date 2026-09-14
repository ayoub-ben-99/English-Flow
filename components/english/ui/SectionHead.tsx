"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "./useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type SectionHeadProps = {
  id: string;
  children: React.ReactNode;
};

/** Section heading with a shared fade-rise entrance (transform/opacity only). */
export function SectionHead({ id, children }: SectionHeadProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion || !ref.current) return;
      gsap.from(ref.current, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    },
    { scope: ref, dependencies: [reduceMotion] },
  );

  return (
    <h2 ref={ref} id={id} className="mb-6 text-3xl font-semibold">
      {children}
    </h2>
  );
}
