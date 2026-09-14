"use client";

import { useRef } from "react";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

type SectionHeadProps = {
  id: string;
  children: React.ReactNode;
};

/** Section heading with a shared fade-rise entrance (transform/opacity only). */
export function SectionHead({ id, children }: SectionHeadProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  useRevealOnScroll(ref, { y: 24, duration: 0.6 });

  return (
    <h2 ref={ref} id={id} className="mb-6 text-3xl font-semibold">
      {children}
    </h2>
  );
}
