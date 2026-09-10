import { Suspense } from "react";
import { CategoryFilter } from "@/components/english/CategoryFilter";
import { Reveal } from "@/components/english/Reveal";
import { LevelFilter } from "@/components/english/LevelFilter";
import { EmptyState } from "@/components/english/EmptyState";
import { GrammarCard } from "@/components/english/GrammarCard";
import { GrammarTopicCard } from "@/components/english/GrammarTopicCard";
import { Pagination } from "@/components/english/Pagination";
import { ProgressHeader } from "@/components/english/ProgressHeader";
import { SearchInput } from "@/components/english/SearchInput";
import grammarCategories from "@/data/english/grammar-categories.json";
import { getGrammarTopics } from "@/lib/pipeline-grammar";
import type { Category } from "@/types/english";

const categories = grammarCategories as Category[];
const categoryName = new Map(categories.map((c) => [c.id, c.arabic]));

type GrammarPageProps = {
  searchParams: Promise<{ category?: string; level?: string; q?: string; page?: string }>;
};

export default async function GrammarPage({ searchParams }: GrammarPageProps) {
  const params = await searchParams;
  const category = params.category ?? "";
  const level = params.level ?? "";
  const q = params.q ?? "";
  const pageNum = Number(params.page ?? "1");
  const { items, total, baseTotal, page, totalPages, levelCounts, pipelineCount } = await getGrammarTopics({
    category,
    level,
    q,
    page: Number.isFinite(pageNum) ? pageNum : 1,
  });
  const { total: sectionTotal } = await getGrammarTopics({});

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">القواعد</h1>
      <p className="muted mt-2">
        {total} موضوع
        {pipelineCount > 0 ? ` (منها ${pipelineCount} من CEFR-J بمستويات)` : ""}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <Suspense>
          <SearchInput placeholder="ابحث بموضوع إنجليزي…" />
        </Suspense>
        <Suspense>
          <CategoryFilter categories={categories} />
        </Suspense>
        <Suspense>
          <LevelFilter counts={levelCounts} total={baseTotal} />
        </Suspense>
        <Suspense>
          <ProgressHeader section="grammar" total={sectionTotal} />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="لا توجد مواضيع مطابقة"
            hint="جرّب كلمة مختلفة أو غيّر الفئة أو المستوى."
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {items.map((item) => (
            <Reveal
              key={item.kind === "curated" ? item.topic.id : item.topic.id}
              itemId={item.topic.id}
              itemSection="grammar"
            >
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
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pathname="/english/grammar"
        params={{
          category: category || undefined,
          level: level || undefined,
          q: q || undefined,
        }}
      />
    </div>
  );
}
