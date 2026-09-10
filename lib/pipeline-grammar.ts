import { promises as fs } from "node:fs";
import path from "node:path";
import curatedGrammar from "@/data/english/grammar.json";
import type { GrammarTopic } from "@/types/english";
import type { PipelineGrammarTopic } from "@/components/english/GrammarTopicCard";

export const GRAMMAR_PAGE_SIZE = 24;

export type GrammarItem =
  | { kind: "curated"; topic: GrammarTopic }
  | { kind: "pipeline"; topic: PipelineGrammarTopic };

let topicsCache: PipelineGrammarTopic[] | null = null;

async function loadPipelineTopics(): Promise<PipelineGrammarTopic[]> {
  if (topicsCache) return topicsCache;
  try {
    const recs = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), "data", "pipeline", "processed", "grammar", "grammar.json"),
        "utf-8",
      ),
    );
    const cleaned: PipelineGrammarTopic[] = (
      recs as Record<string, unknown>[]
    )
      .filter((r) => typeof r === "object" && r !== null)
      .map((r) => ({
        id: String(r.id),
        topic: String(r.topic ?? ""),
        cefrLevel: String(r.cefrLevel ?? ""),
        sentenceType:
          typeof r.sentenceType === "string" && r.sentenceType ? r.sentenceType : null,
        explanation: typeof r.explanation === "string" ? r.explanation : null,
        examples: Array.isArray(r.examples)
          ? (r.examples as Record<string, unknown>[])
              .filter(
                (e) =>
                  typeof e === "object" &&
                  e !== null &&
                  typeof e.english === "string" &&
                  typeof e.arabic === "string",
              )
              .map((e) => ({
                english: e.english as string,
                arabic: e.arabic as string,
              }))
          : [],
      }))
      .filter((t) => t.topic.length > 0);
    topicsCache = cleaned;
  } catch {
    topicsCache = []; // pipeline not present -> curated only
  }
  return topicsCache!;
}

export type GrammarQuery = {
  category?: string;
  level?: string;
  q?: string;
  page?: number;
};

export async function getGrammarTopics(query: GrammarQuery): Promise<{
  items: GrammarItem[];
  total: number;
  baseTotal: number;
  page: number;
  totalPages: number;
  levelCounts: Record<string, number>;
  pipelineCount: number;
}> {
  const category = query.category ?? "";
  const level = query.level ?? "";
  const needle = (query.q ?? "").trim().toLowerCase();
  const pipeline = await loadPipelineTopics();

  const curatedBase: GrammarItem[] = (curatedGrammar as GrammarTopic[])
    .filter((t) => {
      if (category && t.category !== category) return false;
      if (!needle) return true;
      return (
        t.title.toLowerCase().includes(needle) ||
        t.arabicTitle.includes(query.q!.trim())
      );
    })
    .map((topic) => ({ kind: "curated" as const, topic }));

  const bulkBase: GrammarItem[] = pipeline
    .filter((t) => {
      if (category) return false; // pipeline topics carry no category
      if (needle && !t.topic.toLowerCase().includes(needle)) return false;
      return true;
    })
    .map((topic) => ({ kind: "pipeline" as const, topic }));

  const levelCounts: Record<string, number> = {};
  for (const item of bulkBase) {
    if (item.kind !== "pipeline") continue;
    const lv = item.topic.cefrLevel;
    if (lv) levelCounts[lv] = (levelCounts[lv] ?? 0) + 1;
  }
  const baseTotal = curatedBase.length + bulkBase.length;
  // Curated topics carry no CEFR level — excluded under a level filter.
  const visible = [...curatedBase, ...bulkBase].filter(
    (item) => !level || (item.kind === "pipeline" && item.topic.cefrLevel === level),
  );

  const totalPages = Math.max(1, Math.ceil(visible.length / GRAMMAR_PAGE_SIZE));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  return {
    items: visible.slice((page - 1) * GRAMMAR_PAGE_SIZE, page * GRAMMAR_PAGE_SIZE),
    total: visible.length,
    baseTotal,
    page,
    totalPages,
    levelCounts,
    pipelineCount: pipeline.length,
  };
}
