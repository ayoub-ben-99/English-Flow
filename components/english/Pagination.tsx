import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** Base path, e.g. "/english/sentences". */
  pathname: string;
  /** Current params to preserve (category, level, q). */
  params: { category?: string; level?: string; q?: string };
};

function href(
  pathname: string,
  params: { category?: string; level?: string; q?: string },
  page: number,
): string {
  const p = new URLSearchParams();
  if (params.category) p.set("category", params.category);
  if (params.level) p.set("level", params.level);
  if (params.q) p.set("q", params.q);
  if (page > 1) p.set("page", String(page));
  const query = p.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Compact window: 1 … p-1, p, p+1 … N (numbers hidden on small screens). */
function pageWindow(page: number, totalPages: number): (number | "…")[] {
  const set = new Set<number>([1, page - 1, page, page + 1, totalPages]);
  const nums = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) out.push("…");
    out.push(nums[i]);
  }
  return out;
}

export function Pagination({ page, totalPages, pathname, params }: PaginationProps) {
  if (totalPages <= 1) return null;
  const btn =
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium";
  const ghost = {
    border: "1px solid var(--md-sys-color-outline-variant)",
    color: "var(--muted)",
  };
  const current = {
    background: "var(--md-sys-color-primary)",
    color: "var(--md-sys-color-on-primary)",
    borderColor: "transparent",
    fontWeight: 700,
  };
  return (
    <nav
      aria-label="التنقل بين الصفحات"
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <>
          <Link
            href={href(pathname, params, 1)}
            aria-label="الصفحة الأولى"
            title="الصفحة الأولى"
            className={`${btn} hidden sm:inline-flex`}
            style={ghost}
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={href(pathname, params, page - 1)}
            className={btn}
            style={ghost}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            السابق
          </Link>
        </>
      ) : null}
      {pageWindow(page, totalPages).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} aria-hidden="true" className="muted px-1 text-sm">
            …
          </span>
        ) : n === page ? (
          <span
            key={n}
            aria-current="page"
            aria-label={`الصفحة ${n}`}
            className={`${btn} hidden sm:inline-flex`}
            style={current}
          >
            <span dir="ltr">{n}</span>
          </span>
        ) : (
          <Link
            key={n}
            href={href(pathname, params, n)}
            aria-label={`الصفحة ${n}`}
            className={`${btn} hidden sm:inline-flex`}
            style={ghost}
          >
            <span dir="ltr">{n}</span>
          </Link>
        ),
      )}
      {page < totalPages ? (
        <>
          <Link
            href={href(pathname, params, page + 1)}
            className={btn}
            style={ghost}
          >
            التالي
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={href(pathname, params, totalPages)}
            aria-label={`الصفحة الأخيرة (${totalPages})`}
            title="الصفحة الأخيرة"
            className={`${btn} hidden sm:inline-flex`}
            style={ghost}
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </>
      ) : null}
    </nav>
  );
}
