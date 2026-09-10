"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";

type ChipOption = { id: string; arabic: string; english?: string };

type CategoryFilterProps = {
  categories: ChipOption[];
  /** Label for the "all" option. */
  allLabel?: string;
  /** URL param to sync (default "category"). */
  param?: string;
  /** Accessible group label. */
  groupLabel?: string;
  /** Optional per-option counts shown next to labels (faceted filter). */
  counts?: Record<string, number>;
};

/**
 * Collapsible category bar: closed by default showing the current selection
 * ("All" initially). Opening reveals the chips with a staggered fade;
 * closing animates back symmetrically. Content never unmounts, so no
 * focus loss and no layout jumps.
 */
export function CategoryFilter({
  categories = [],
  allLabel = "الكل",
  param = "category",
  groupLabel = "تصفية حسب الفئة",
  counts,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const active = searchParams.get(param) ?? "";
  const activeName =
    active === ""
      ? allLabel
      : (categories ?? []).find((c) => c.id === active)?.arabic ?? allLabel;

  function select(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set(param, id);
    else params.delete(param);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const chip = (isActive: boolean): React.CSSProperties =>
    isActive
      ? {
          background: "var(--md-sys-color-primary)",
          color: "var(--md-sys-color-on-primary)",
          borderColor: "transparent",
        }
      : {
          background: "transparent",
          color: "var(--muted)",
          border: "1px solid var(--md-sys-color-outline-variant)",
        };

  const options = [{ id: "", arabic: allLabel }, ...(categories ?? [])];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-4 text-sm"
        style={{
          border: "1px solid var(--md-sys-color-outline-variant)",
          color: "var(--md-sys-color-on-surface)",
        }}
      >
        <span className="flex items-center gap-2 overflow-hidden">
          <span className="muted shrink-0">{groupLabel}:</span>
          <strong className="truncate font-semibold">{activeName}</strong>
        </span>
        <ChevronDown
          className="h-5 w-5 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
          aria-hidden="true"
        />
      </button>

      <div id={panelId} className={`cat-panel${open ? " cat-open" : ""}`}>
        <div className="cat-panel-inner">
          <div
            className="flex flex-wrap gap-2 px-0.5 py-2"
            role="group"
            aria-label={groupLabel}
            aria-hidden={!open}
          >
            {options.map((c, i) => (
              <button
                key={c.id || "all"}
                type="button"
                onClick={() => select(c.id)}
                aria-pressed={active === c.id}
                tabIndex={open ? 0 : -1}
                className={`cat-chip min-h-11 shrink-0 rounded-full px-4 text-sm font-medium${open ? " cat-in" : ""}`}
                style={{ ...chip(active === c.id), transitionDelay: open ? `${i * 30}ms` : "0ms" }}
                title={c.english}
              >
                {c.arabic}
                {c.id !== "" && counts?.[c.id] !== undefined ? (
                  <span className="opacity-70" dir="ltr">
                    {" "}
                    · {counts[c.id].toLocaleString("en-US")}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
