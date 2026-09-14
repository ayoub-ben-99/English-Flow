"use client";

import { useEffect, useState } from "react";

/** Tracks the OS reduced-motion preference (SSR-safe: defaults to false). */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduce;
}
