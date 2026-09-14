import { Suspense } from "react";
import { CategoryFilter } from "@/components/english/filters/CategoryFilter";
import { Reveal } from "@/components/english/motion/Reveal";
import { EmptyState } from "@/components/english/ui/EmptyState";
import { LevelFilter } from "@/components/english/filters/LevelFilter";
import { Pagination } from "@/components/english/layout/Pagination";
import { FilteredSentences } from "@/components/english/progress/ProgressFilteredList";
import { ProgressHeader } from "@/components/english/progress/ProgressHeader";
import { SearchInput } from "@/components/english/filters/SearchInput";
import { SentenceCard } from "@/components/english/cards/SentenceCard";
import sentenceCategories from "@/data/english/sentence-categories.json";
import { getSentences } from "@/lib/pipeline-sentences";
import type { Category } from "@/types/english";

const categories = sentenceCategories as Category[];
const categoryName = new Map(categories.map((c) => [c.id, c.arabic]));

type SentencesPageProps = {
  searchParams: Promise<{ category?: string; level?: string; q?: string; page?: string; view?: string }>;
};

export default async function SentencesPage({
  searchParams,
}: SentencesPageProps) {
  const params = await searchParams;
  const category = params.category ?? "";
  const level = params.level ?? "";
  const q = params.q ?? "";
  const view = params.view === "todo" || params.view === "done" ? params.view : "all";
  const pageNum = Number(params.page ?? "1");
  const { items, total, baseTotal, page, totalPages, levelCounts } = await getSentences({
    category,
    level,
    q,
    page: Number.isFinite(pageNum) ? pageNum : 1,
  });
  const { total: sectionTotal } = await getSentences({});

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">الجمل</h1>
      <p className="muted mt-2">
        {total} جملة من المنهج (2000 جملة مترجمة بمستويات CEFR)
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <Suspense>
          <SearchInput placeholder="ابحث بجملة إنجليزية أو عربية…" />
        </Suspense>
        <Suspense>
          <CategoryFilter categories={categories} />
        </Suspense>
        <Suspense>
          <LevelFilter counts={levelCounts} total={baseTotal} />
        </Suspense>
        <Suspense>
          <ProgressHeader section="sentences" total={sectionTotal} />
        </Suspense>
      </div>

      {view !== "all" ? (
        <Suspense>
          <FilteredSentences categories={categories} />
        </Suspense>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="لا توجد جمل مطابقة"
            hint="جرّب كلمة مختلفة أو غيّر الفئة أو المستوى."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((s) => (
            <Reveal key={s.id} itemId={s.id} itemSection="sentences">
              <SentenceCard
                sentence={s}
                categoryName={categoryName.get(s.category) ?? "غير مصنف"}
              />
            </Reveal>
          ))}
        </div>
      )}

      {view === "all" ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          pathname="/english/sentences"
          params={{
            category: category || undefined,
            level: level || undefined,
            q: q || undefined,
          }}
        />
      ) : null}
    </div>
  );
}
