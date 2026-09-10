import { Suspense } from "react";
import { CategoryFilter } from "@/components/english/CategoryFilter";
import { Reveal } from "@/components/english/Reveal";
import { EmptyState } from "@/components/english/EmptyState";
import { LevelFilter } from "@/components/english/LevelFilter";
import { Pagination } from "@/components/english/Pagination";
import { ProgressHeader } from "@/components/english/ProgressHeader";
import { SearchInput } from "@/components/english/SearchInput";
import { WordCard } from "@/components/english/WordCard";
import termCategories from "@/data/english/term-categories.json";
import { getWords } from "@/lib/pipeline-words";
import type { Category } from "@/types/english";

const categories = termCategories as Category[];
const categoryName = new Map(categories.map((c) => [c.id, c.arabic]));

type TermsPageProps = {
  searchParams: Promise<{ category?: string; level?: string; q?: string; page?: string }>;
};

export default async function TermsPage({ searchParams }: TermsPageProps) {
  const params = await searchParams;
  const category = params.category ?? "";
  const level = params.level ?? "";
  const q = params.q ?? "";
  const pageNum = Number(params.page ?? "1");
  const { items, total, baseTotal, page, totalPages, levelCounts } = await getWords({
    category,
    level,
    q,
    page: Number.isFinite(pageNum) ? pageNum : 1,
  });
  const { total: sectionTotal } = await getWords({});

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">المفردات</h1>
      <p className="muted mt-2">
        {total} كلمة من المنهج (2000 كلمة مترجمة بمستويات CEFR)
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <Suspense>
          <SearchInput />
        </Suspense>
        <Suspense>
          <CategoryFilter categories={categories} />
        </Suspense>
        <Suspense>
          <LevelFilter counts={levelCounts} total={baseTotal} />
        </Suspense>
        <Suspense>
          <ProgressHeader section="terms" total={sectionTotal} />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="لا توجد نتائج مطابقة"
            hint="جرّب كلمة مختلفة أو غيّر الفئة أو المستوى."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
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
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pathname="/english/terms"
        params={{
          category: category || undefined,
          level: level || undefined,
          q: q || undefined,
        }}
      />
    </div>
  );
}
