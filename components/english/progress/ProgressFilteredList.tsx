"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../ui/EmptyState";
import { GrammarCard } from "../cards/GrammarCard";
import { GrammarTopicCard } from "../cards/GrammarTopicCard";
import { buildPageHref, pageWindow, type PageParams } from "../layout/Pagination";
import { Reveal } from "../motion/Reveal";
import { SentenceCard } from "../cards/SentenceCard";
import { WordCard } from "../cards/WordCard";
import { useCompletedIds, type ProgressSection } from "@/lib/progress";
import type { GrammarItem } from "@/lib/pipeline-grammar";
import type { FinalSentence } from "@/lib/pipeline-sentences";
import type { WordItem } from "@/lib/pipeline-words";

export const FILTERED_PAGE_SIZE = 24;

type CategoryOption = { id: string; arabic: string };

function scopeQuery(category: string, level: string, q: string): string {
  const p = new URLSearchParams();
  if (category) p.set("category", category);
  if (level) p.set("level", level);
  if (q) p.set("q", q);
  return p.toString();
}

/**
 * Client pager for the todo/done views. Rendered only when there is more
 * than one page — identical look to the server pager.
 */
function FilteredPagination({
  page,
  totalPages,
  pathname,
  params,
}: {
  page: number;
  totalPages: number;
  pathname: string;
  params: PageParams;
}) {
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
            href={buildPageHref(pathname, params, 1)}
            aria-label="الصفحة الأولى"
            title="الصفحة الأولى"
            className={`${btn} hidden sm:inline-flex`}
            style={ghost}
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={buildPageHref(pathname, params, page - 1)}
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
            href={buildPageHref(pathname, params, n)}
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
            href={buildPageHref(pathname, params, page + 1)}
            className={btn}
            style={ghost}
          >
            التالي
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={buildPageHref(pathname, params, totalPages)}
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

function useFilteredScope() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "all";
  const category = searchParams.get("category") ?? "";
  const level = searchParams.get("level") ?? "";
  const q = searchParams.get("q") ?? "";
  const rawPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  return {
    pathname,
    view: view as "all" | "todo" | "done",
    category,
    level,
    q,
    page,
    params: {
      category: category || undefined,
      level: level || undefined,
      q: q || undefined,
      view,
    } satisfies PageParams,
  };
}

function filterByView<T>(ids: T[], isDone: (id: string) => boolean, view: string, getId: (item: T) => string): T[] {
  return ids.filter((item) => (view === "done") === isDone(getId(item)));
}

function paginate<T>(all: T[], page: number): { pageItems: T[]; page: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(all.length / FILTERED_PAGE_SIZE));
  const safe = Math.min(Math.max(1, page), totalPages);
  return {
    pageItems: all.slice((safe - 1) * FILTERED_PAGE_SIZE, safe * FILTERED_PAGE_SIZE),
    page: safe,
    totalPages,
  };
}

function useDoneSet(section: ProgressSection): Set<string> {
  const doneIds = useCompletedIds(section);
  return useMemo(() => new Set(doneIds), [doneIds]);
}

async function fetchItems<T>(endpoint: string, query: string): Promise<T[]> {
  const res = await fetch(query ? `${endpoint}?${query}` : endpoint);
  if (!res.ok) throw new Error(`Failed to load ${endpoint}`);
  const data = (await res.json()) as { items: T[] };
  return data.items;
}

/** Fetch every item in the current filter scope; null while loading. */
function useScopedItems<T>(
  endpoint: string,
  category: string,
  level: string,
  q: string,
): T[] | null {
  const query = scopeQuery(category, level, q);
  const [cached, setCached] = useState<{ query: string; items: T[] } | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchItems<T>(endpoint, query)
      .then((all) => {
        if (!cancelled) setCached({ query, items: all });
      })
      .catch(() => {
        if (!cancelled) setCached({ query, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint, query]);
  return cached && cached.query === query ? cached.items : null;
}

function LoadingState() {
  return (
    <div className="mt-6 grid gap-4" role="status" aria-label="جارٍ التحميل">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="card animate-pulse p-5"
          style={{ minHeight: 96 }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/** Todo/done view for vocabulary: filters across the whole scope with paging. */
export function FilteredTerms({ categories }: { categories: CategoryOption[] }) {
  const { pathname, view, category, level, q, page, params } = useFilteredScope();
  const doneSet = useDoneSet("terms");
  const items = useScopedItems<WordItem>("/api/english/terms", category, level, q);
  const categoryName = useMemo(
    () => new Map(categories.map((c) => [c.id, c.arabic])),
    [categories],
  );

  const filtered = useMemo(
    () =>
      filterByView(items ?? [], (id) => doneSet.has(id), view, (i) => i.word.sourceId),
    [items, doneSet, view],
  );
  const { pageItems, page: safePage, totalPages } = paginate(filtered, page);

  if (items === null) return <LoadingState />;
  if (filtered.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          title={view === "done" ? "لا عناصر مُنجزة بعد" : "كل عناصر هذا القسم مُنجزة — أحسنت!"}
          hint={
            view === "done"
              ? "حدد ✓ على أي بطاقة من عرض الكل لتظهر هنا."
              : "بدّل إلى عرض الكل لرؤية كل العناصر."
          }
        />
      </div>
    );
  }
  return (
    <div>
      <p className="muted mt-4 text-sm" role="status">
        {filtered.length} {view === "done" ? "مُنجزة" : "للتعلم"}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {pageItems.map((item, i) => (
          <Reveal
            key={item.word.sourceId}
            delay={(i % 2) * 0.06}
            itemId={item.word.sourceId}
            itemSection="terms"
          >
            <WordCard
              word={item.word}
              categoryName={categoryName.get(item.word.category) ?? "غير مصنف"}
            />
          </Reveal>
        ))}
      </div>
      <FilteredPagination
        page={safePage}
        totalPages={totalPages}
        pathname={pathname}
        params={params}
      />
    </div>
  );
}

/** Todo/done view for sentences: filters across the whole scope with paging. */
export function FilteredSentences({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const { pathname, view, category, level, q, page, params } = useFilteredScope();
  const doneSet = useDoneSet("sentences");
  const items = useScopedItems<FinalSentence>("/api/english/sentences", category, level, q);
  const categoryName = useMemo(
    () => new Map(categories.map((c) => [c.id, c.arabic])),
    [categories],
  );

  const filtered = useMemo(
    () => filterByView(items ?? [], (id) => doneSet.has(id), view, (s) => s.id),
    [items, doneSet, view],
  );
  const { pageItems, page: safePage, totalPages } = paginate(filtered, page);

  if (items === null) return <LoadingState />;
  if (filtered.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          title={view === "done" ? "لا عناصر مُنجزة بعد" : "كل عناصر هذا القسم مُنجزة — أحسنت!"}
          hint={
            view === "done"
              ? "حدد ✓ على أي بطاقة من عرض الكل لتظهر هنا."
              : "بدّل إلى عرض الكل لرؤية كل العناصر."
          }
        />
      </div>
    );
  }
  return (
    <div>
      <p className="muted mt-4 text-sm" role="status">
        {filtered.length} {view === "done" ? "مُنجزة" : "للتعلم"}
      </p>
      <div className="mt-4 grid gap-4">
        {pageItems.map((s) => (
          <Reveal key={s.id} itemId={s.id} itemSection="sentences">
            <SentenceCard
              sentence={s}
              categoryName={categoryName.get(s.category) ?? "غير مصنف"}
            />
          </Reveal>
        ))}
      </div>
      <FilteredPagination
        page={safePage}
        totalPages={totalPages}
        pathname={pathname}
        params={params}
      />
    </div>
  );
}

/** Todo/done view for grammar: filters across the whole scope with paging. */
export function FilteredGrammar({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const { pathname, view, category, level, q, page, params } = useFilteredScope();
  const doneSet = useDoneSet("grammar");
  const items = useScopedItems<GrammarItem>("/api/english/grammar", category, level, q);
  const categoryName = useMemo(
    () => new Map(categories.map((c) => [c.id, c.arabic])),
    [categories],
  );

  const filtered = useMemo(
    () => filterByView(items ?? [], (id) => doneSet.has(id), view, (i) => i.topic.id),
    [items, doneSet, view],
  );
  const { pageItems, page: safePage, totalPages } = paginate(filtered, page);

  if (items === null) return <LoadingState />;
  if (filtered.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          title={view === "done" ? "لا عناصر مُنجزة بعد" : "كل عناصر هذا القسم مُنجزة — أحسنت!"}
          hint={
            view === "done"
              ? "حدد ✓ على أي بطاقة من عرض الكل لتظهر هنا."
              : "بدّل إلى عرض الكل لرؤية كل العناصر."
          }
        />
      </div>
    );
  }
  return (
    <div>
      <p className="muted mt-4 text-sm" role="status">
        {filtered.length} {view === "done" ? "مُنجزة" : "للتعلم"}
      </p>
      <div className="mt-4 flex flex-col gap-4">
        {pageItems.map((item) => (
          <Reveal key={item.topic.id} itemId={item.topic.id} itemSection="grammar">
            {item.kind === "curated" ? (
              <GrammarCard
                topic={item.topic}
                categoryName={categoryName.get(item.topic.category) ?? "غير مصنف"}
              />
            ) : (
              <GrammarTopicCard topic={item.topic} />
            )}
          </Reveal>
        ))}
      </div>
      <FilteredPagination
        page={safePage}
        totalPages={totalPages}
        pathname={pathname}
        params={params}
      />
    </div>
  );
}
