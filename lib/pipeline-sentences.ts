import { promises as fs } from "node:fs";
import path from "node:path";
import curated from "@/data/english/sentences.json";
import type { Sentence } from "@/types/english";

export const PAGE_SIZE = 24;

export type FinalSentence = Sentence & {
  cefrLevel: string;
  grammarTopic: string | null;
};

/** Tiny in-memory cache (final dataset is 2000 records). */
let cache: FinalSentence[] | null = null;

function toFinalSentence(r: Record<string, unknown>): FinalSentence | null {
  if (typeof r?.english !== "string" || typeof r?.arabic !== "string") return null;
  return {
    id: String(r.sourceId ?? r.id ?? `${r.english}`.slice(0, 40)),
    english: r.english as string,
    arabic: r.arabic as string,
    category: typeof r.category === "string" ? (r.category as string) : "daily-life",
    cefrLevel: typeof r.cefrLevel === "string" ? (r.cefrLevel as string) : "",
    grammarTopic:
      typeof r.grammarTopic === "string" && r.grammarTopic ? (r.grammarTopic as string) : null,
  };
}

function curatedFallback(): FinalSentence[] {
  return (curated as Sentence[]).map((s) => ({ ...s, cefrLevel: "", grammarTopic: null }));
}

async function loadFinalSentences(): Promise<FinalSentence[]> {
  if (cache) return cache;
  try {
    const recs = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), "data", "pipeline", "final", "sentences.json"),
        "utf-8",
      ),
    );
    const out: FinalSentence[] = [];
    for (const r of recs) {
      const s = toFinalSentence(r);
      if (s) out.push(s);
    }
    cache = out.length > 0 ? out : curatedFallback();
  } catch {
    cache = curatedFallback(); // final dataset absent -> curated only
  }
  return cache!;
}

export type SentenceQuery = {
  category?: string;
  level?: string;
  q?: string;
  page?: number;
};

export async function getSentences(query: SentenceQuery): Promise<{
  items: FinalSentence[];
  total: number;
  baseTotal: number;
  page: number;
  totalPages: number;
  levelCounts: Record<string, number>;
  pipelineCount: number;
}> {
  const all = await loadFinalSentences();
  const category = query.category ?? "";
  const level = query.level ?? "";
  const needle = (query.q ?? "").trim().toLowerCase();
  const qTrim = (query.q ?? "").trim();

  const inScope = all.filter((s) => {
    if (category && s.category !== category) return false;
    if (needle && !s.english.toLowerCase().includes(needle) && !s.arabic.includes(qTrim))
      return false;
    return true;
  });

  const levelCounts: Record<string, number> = {};
  for (const s of inScope) {
    if (s.cefrLevel) levelCounts[s.cefrLevel] = (levelCounts[s.cefrLevel] ?? 0) + 1;
  }
  const baseTotal = inScope.length;
  const visible = level ? inScope.filter((s) => s.cefrLevel === level) : inScope;

  const total = visible.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  return {
    items: visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total,
    baseTotal,
    page,
    totalPages,
    levelCounts,
    pipelineCount: all.length,
  };
}
