import { NextResponse } from "next/server";
import { getAllWords } from "@/lib/pipeline-words";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await getAllWords({
    category: searchParams.get("category") ?? "",
    level: searchParams.get("level") ?? "",
    q: searchParams.get("q") ?? "",
  });
  return NextResponse.json({ items, total: items.length });
}
