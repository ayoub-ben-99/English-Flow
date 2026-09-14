import { promises as fs } from "node:fs";
import path from "node:path";
import curatedTerms from "@/data/english/terms.json";
import type { Term } from "@/types/english";

export const WORD_PAGE_SIZE = 24;

/** Final curriculum word (data/pipeline/final/words.json). */
export type FinalWord = {
  word: string;
  translation: string;
  partOfSpeech: string;
  cefrLevel: string;
  category: string;
  definition: string;
  exampleSentence: string | null;
  source: string;
  sourceId: string;
  license: string;
};

export type WordItem = { kind: "final"; word: FinalWord };

/** Tiny in-memory cache (final dataset is ~2k records). */
let cache: FinalWord[] | null = null;

function toFinalWord(r: Record<string, unknown>): FinalWord | null {
  if (typeof r?.word !== "string" || typeof r?.translation !== "string") return null;
  return {
    word: r.word as string,
    translation: r.translation as string,
    partOfSpeech: typeof r.partOfSpeech === "string" ? (r.partOfSpeech as string) : "",
    cefrLevel: typeof r.cefrLevel === "string" ? (r.cefrLevel as string) : "",
    category: typeof r.category === "string" ? (r.category as string) : "daily-life",
    definition: typeof r.definition === "string" ? (r.definition as string) : "",
    exampleSentence:
      typeof r.exampleSentence === "string" && r.exampleSentence ? (r.exampleSentence as string) : null,
    source: typeof r.source === "string" ? (r.source as string) : "",
    sourceId: typeof r.sourceId === "string" ? (r.sourceId as string) : (r.word as string),
    license: typeof r.license === "string" ? (r.license as string) : "",
  };
}

function curatedFallback(): FinalWord[] {
  return (curatedTerms as Term[]).map((t) => ({
    word: t.english,
    translation: t.arabic,
    partOfSpeech: "phrase",
    cefrLevel: "",
    category: t.category,
    definition: "",
    exampleSentence: t.example ?? null,
    source: "curated",
    sourceId: t.id,
    license: "project",
  }));
}

async function loadFinalWords(): Promise<FinalWord[]> {
  if (cache) return cache;
  try {
    const recs = JSON.parse(
      await fs.readFile(path.join(process.cwd(), "data", "pipeline", "final", "words.json"), "utf-8"),
    );
    const out: FinalWord[] = [];
    for (const r of recs) {
      const w = toFinalWord(r);
      if (w) out.push(w);
    }
    if (out.length === 0) {
      cache = curatedFallback();
      return cache!;
    }
    // Curated app terms not covered by the final curriculum (e.g. the
    // programming glossary) are appended; final records win on collision.
    const finalLemmas = new Set(out.map((w) => w.word.toLowerCase()));
    for (const t of curatedTerms as Term[]) {
      if (finalLemmas.has(t.english.toLowerCase())) continue;
      out.push({
        word: t.english,
        translation: t.arabic,
        partOfSpeech: "phrase",
        cefrLevel: "",
        category: t.category,
        definition: "",
        exampleSentence: t.example ?? null,
        source: "curated",
        sourceId: t.id,
        license: "project",
      });
    }
    cache = out;
  } catch {
    cache = curatedFallback(); // final dataset absent -> curated only
  }
  return cache!;
}

export type WordQuery = {
  category?: string;
  level?: string;
  q?: string;
  page?: number;
};

export async function getWords(query: WordQuery): Promise<{
  items: WordItem[];
  total: number;
  baseTotal: number;
  page: number;
  totalPages: number;
  levelCounts: Record<string, number>;
  pipelineCount: number;
}> {
  const all = await loadFinalWords();
  const category = query.category ?? "";
  const level = query.level ?? "";
  const needle = (query.q ?? "").trim().toLowerCase();
  const qTrim = (query.q ?? "").trim();

  const inScope = all.filter((w) => {
    if (category && w.category !== category) return false;
    if (
      needle &&
      !w.word.toLowerCase().includes(needle) &&
      !w.translation.includes(qTrim)
    )
      return false;
    return true;
  });

  const levelCounts: Record<string, number> = {};
  for (const w of inScope) {
    if (w.cefrLevel) levelCounts[w.cefrLevel] = (levelCounts[w.cefrLevel] ?? 0) + 1;
  }
  const baseTotal = inScope.length;
  const visible = level ? inScope.filter((w) => w.cefrLevel === level) : inScope;

  const total = visible.length;
  const totalPages = Math.max(1, Math.ceil(total / WORD_PAGE_SIZE));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  return {
    items: visible
      .slice((page - 1) * WORD_PAGE_SIZE, page * WORD_PAGE_SIZE)
      .map((word) => ({ kind: "final" as const, word })),
    total,
    baseTotal,
    page,
    totalPages,
    levelCounts,
    pipelineCount: all.length,
  };
}

/** All matching words without pagination (for todo/done client views). */
export async function getAllWords(
  query: Omit<WordQuery, "page">,
): Promise<WordItem[]> {
  const all = await loadFinalWords();
  const category = query.category ?? "";
  const level = query.level ?? "";
  const needle = (query.q ?? "").trim().toLowerCase();
  const qTrim = (query.q ?? "").trim();
  return all
    .filter((w) => {
      if (category && w.category !== category) return false;
      if (level && w.cefrLevel !== level) return false;
      if (
        needle &&
        !w.word.toLowerCase().includes(needle) &&
        !w.translation.includes(qTrim)
      )
        return false;
      return true;
    })
    .map((word) => ({ kind: "final" as const, word }));
}
