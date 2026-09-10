"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CEFR_LEVELS } from "@/lib/levels";
import { levelChipStyle } from "./LevelBadge";

type LevelFilterProps = {
  /** Per-level counts over the current category+q scope. */
  counts: Record<string, number>;
  /** Total in scope (for the neutral "All" chip). */
  total: number;
};

/** CEFR level selector: each level wears its own colors; "All" stays neutral. */
export function LevelFilter({ counts, total }: LevelFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("level") ?? "";

  function select(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("level", id);
    else params.delete("level");
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div
      className="flex flex-wrap gap-2 pb-1"
      role="group"
      aria-label="تصفية حسب مستوى CEFR"
    >
      <button
        type="button"
        onClick={() => select("")}
        aria-pressed={active === ""}
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium"
        style={
          active === ""
            ? {
                background: "var(--md-sys-color-primary)",
                color: "var(--md-sys-color-on-primary)",
                borderColor: "transparent",
                fontWeight: 700,
              }
            : {
                background: "transparent",
                color: "var(--muted)",
                border: "1px solid var(--md-sys-color-outline-variant)",
              }
        }
      >
        الكل
        <span className="opacity-70" dir="ltr">
          · {total.toLocaleString("en-US")}
        </span>
      </button>
      {CEFR_LEVELS.map((level) => {
        const isActive = active === level;
        return (
          <button
            key={level}
            type="button"
            onClick={() => select(level)}
            aria-pressed={isActive}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm"
            style={levelChipStyle(level, isActive)}
            title={`المستوى ${level}`}
          >
            {isActive ? (
              <Check className="h-4 w-4" aria-hidden="true" strokeWidth={3} />
            ) : null}
            <span dir="ltr">{level}</span>
            <span className="opacity-70" dir="ltr">
              · {(counts[level] ?? 0).toLocaleString("en-US")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
