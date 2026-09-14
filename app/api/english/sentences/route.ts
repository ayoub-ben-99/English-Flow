import { NextResponse } from "next/server";
import { getAllSentences } from "@/lib/pipeline-sentences";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await getAllSentences({
    category: searchParams.get("category") ?? "",
    level: searchParams.get("level") ?? "",
    q: searchParams.get("q") ?? "",
  });
  return NextResponse.json({ items, total: items.length });
}
