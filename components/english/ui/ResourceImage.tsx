"use client";

import { useEffect, useRef, useState } from "react";

type ResourceImageProps = {
  src?: string;
  alt: string;
  fallbackLabel: string;
  fallbackTint: string;
};

/** Remote image with automatic fallback to the initial tile on any error. */
export function ResourceImage({ src, alt, fallbackLabel, fallbackTint }: ResourceImageProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // Catch failures that fired before hydration attached onError.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold"
        style={{ background: fallbackTint, color: "var(--card-ink)" }}
      >
        {fallbackLabel}
      </span>
    );
  }
  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      loading="lazy"
      width={48}
      height={48}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-12 w-12 shrink-0 rounded-xl object-cover"
      style={{ background: fallbackTint }}
    />
  );
}
