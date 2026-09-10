"use client";

import Link from "next/link";
import { useCompletedIds, type ProgressSection } from "@/lib/progress";

type SectionProgress = {
  section: ProgressSection;
  href: string;
  title: string;
  total: number;
};

/** Compact per-section progress bars for the English home page. */
export function HomeProgress({ sections }: { sections: SectionProgress[] }) {
  return (
    <div className="card mt-6 p-6" aria-label="ملخص التقدم">
      <h2 className="mb-1 text-lg font-semibold">تقدمك</h2>
      <p className="muted mb-4 text-sm">
        حدد ✓ على ما تتقنه لتتبع تقدمك — يُحفظ على جهازك.
      </p>
      <div className="flex flex-col gap-4">
        {sections.map((s) => (
          <SectionRow key={s.section} {...s} />
        ))}
      </div>
    </div>
  );
}

function SectionRow({ section, href, title, total }: SectionProgress) {
  const done = useCompletedIds(section).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
        <Link href={href} className="font-medium hover:underline">
          {title}
        </Link>
        <span className="muted shrink-0 text-sm" dir="ltr" aria-live="polite">
          {done.toLocaleString("en-US")} / {total.toLocaleString("en-US")} ({pct}%)
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`التقدم في ${title}`}
        className="h-2 overflow-hidden rounded-full"
        style={{ background: "var(--md-sys-color-surface-container-high)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: "var(--tag-green-ink)" }}
        />
      </div>
    </div>
  );
}
