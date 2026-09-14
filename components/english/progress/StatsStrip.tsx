"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "../hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { value: 2000, label: "كلمة مترجمة" },
  { value: 2000, label: "جملة مترجمة" },
  { value: 179, label: "موضوع قواعدي" },
  { value: 4, label: "أصوات نطق" },
];

/** Animated counters that count up once when scrolled into view. */
export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion || !ref.current) return;
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count ?? "0");
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.4,
            ease: "power1.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
            onUpdate: () => {
              el.textContent = Math.round(obj.v).toLocaleString("en-US");
            },
          });
        });
      }, ref);
      return () => ctx.revert();
    },
    { scope: ref, dependencies: [reduceMotion] },
  );

  return (
    <div
      ref={ref}
      role="region"
      aria-label="محتويات المنصة بالأرقام"
      className="mx-auto px-4 sm:px-6"
      style={{ maxWidth: 880 }}
    >
      <div className="grid grid-cols-2 gap-4 py-10 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <p
              data-count={s.value}
              className="text-3xl font-semibold tabular-nums"
              dir="ltr"
              style={{ color: "var(--md-sys-color-primary)" }}
            >
              {s.value.toLocaleString("en-US")}
            </p>
            <p className="muted mt-1 text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
