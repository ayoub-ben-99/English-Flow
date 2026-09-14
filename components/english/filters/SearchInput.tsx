"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Simple debounced search box synced to the `?q=` URL param. */
export function SearchInput({
  placeholder = "ابحث بكلمة إنجليزية أو عربية…",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    // Only sync when the input differs from the URL (i.e. the user typed).
    // Without this, unrelated navigations (e.g. ?page=2) re-run this effect
    // and its page-stripping bounces the user back to page 1.
    if (value === (searchParams.get("q") ?? "")) return;
    const id = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      params.delete("page");
      const next = params.toString();
      if (next === searchParams.toString()) return;
      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    }, 250);
    return () => window.clearTimeout(id);
  }, [value, pathname, router, searchParams]);

  return (
    <div role="search" className="relative">
      <label htmlFor="english-search" className="sr-only">
        بحث في المفردات
      </label>
      <Search
        className="muted pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 right-4"
        aria-hidden="true"
      />
      <input
        id="english-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="min-h-11 w-full rounded-lg py-2.5 pr-11 pl-4 text-base"
        style={{
          background: "var(--md-sys-color-surface)",
          border: "1px solid var(--md-sys-color-outline)",
          color: "var(--md-sys-color-on-surface)",
        }}
      />
    </div>
  );
}
