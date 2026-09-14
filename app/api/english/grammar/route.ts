import { NextResponse } from "next/server";
import { getAllGrammarTopics } from "@/lib/pipeline-grammar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await getAllGrammarTopics({
    category: searchParams.get("category") ?? "",
    level: searchParams.get("level") ?? "",
    q: searchParams.get("q") ?? "",
  });
  return NextResponse.json({ items, total: items.length });
}
