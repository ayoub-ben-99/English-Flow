"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SegmentedControl } from "../ui/SegmentedControl";
import { useCompletedIds, type ProgressSection } from "@/lib/progress";

export type ProgressView = "all" | "todo" | "done";

const VIEWS: { id: ProgressView; arabic: string }[] = [
  { id: "all", arabic: "الكل" },
  { id: "todo", arabic: "للتعلم" },
  { id: "done", arabic: "المُنجزة" },
];

type ProgressHeaderProps = {
  section: ProgressSection;
  /** Global section total (unfiltered). */
  total: number;
};

/**
 * Learning progress for one section: X/Y bar plus an All/Todo/Done view
 * switch. The todo/done views filter across the whole scope (server-side
 * filters + localStorage progress) with their own pagination; the "all"
 * view keeps the server pager. Progress persists in localStorage.
 */
export function ProgressHeader({ section, total }: ProgressHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") ?? "all") as ProgressView;
  const doneIds = useCompletedIds(section);
  const doneCount = doneIds.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  function select(next: ProgressView) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("view");
    else params.set("view", next);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div>
        <div className="mb-1 flex items-center justify-between gap-2 text-sm">
          <span className="font-medium">تقدم التعلم</span>
          <span className="muted" dir="ltr" aria-live="polite">
            {doneCount.toLocaleString("en-US")} / {total.toLocaleString("en-US")} ({pct}%)
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="تقدم التعلم"
          className="h-2 overflow-hidden rounded-full"
          style={{ background: "var(--md-sys-color-surface-container-high)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%`, background: "var(--tag-green-ink)" }}
          />
        </div>
      </div>

      <SegmentedControl
        ariaLabel="عرض حسب الإنجاز"
        items={VIEWS.map((v) => ({ id: v.id, label: `عرض ${v.arabic}`, content: v.arabic }))}
        value={view}
        onChange={select}
      />
    </div>
  );
}
