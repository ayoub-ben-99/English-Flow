import { BookOpen, ExternalLink, Youtube } from "lucide-react";
import images from "@/data/english/resource-images.json";
import type { LearningResource } from "@/types/english";
import { ResourceImage } from "../ui/ResourceImage";

const CATEGORY_LABELS: Record<string, string> = {
  grammar: "قواعد",
  vocabulary: "مفردات",
  listening: "استماع",
  pronunciation: "نطق",
  speaking: "محادثة",
  reading: "قراءة",
};

const TILE_TINTS = [
  "var(--notion-mint)",
  "var(--notion-sky)",
  "var(--notion-lavender)",
  "var(--notion-yellow-bold)",
  "var(--notion-rose)",
  "var(--notion-peach)",
];

/** Deterministic tile color from the id (stable across renders, offline-safe). */
function tileTint(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return TILE_TINTS[hash % TILE_TINTS.length];
}

/**
 * Learning resource card. Thumbnails are NOT hotlinked (they rot and need
 * an API key); instead each resource gets a stable tinted initial tile.
 */
export function ResourceCard({ resource }: { resource: LearningResource }) {
  const isChannel = resource.type === "youtube_channel";
  const initial = resource.title.replace(/^[^A-Za-z\u0600-\u06FF]+/, "").charAt(0);
  return (
    <article className="card flex flex-col gap-3 p-5">
      <div className="flex items-start gap-3">
        <ResourceImage
          src={(images as Record<string, string>)[resource.id]}
          alt=""
          fallbackLabel={initial}
          fallbackTint={tileTint(resource.id)}
        />
        <div className="min-w-0">
          <h2 className="font-semibold leading-snug">{resource.title}</h2>
          <p className="muted mt-0.5 flex items-center gap-1 text-xs">
            {isChannel ? (
              <Youtube className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {isChannel ? "قناة يوتيوب" : `كتاب · ${resource.author ?? ""}`}
          </p>
        </div>
      </div>

      <p className="card-ink text-sm">{resource.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="tag tag-purple" dir="ltr">
          {resource.levels[0]}–{resource.levels[resource.levels.length - 1]}
        </span>
        {resource.categories.map((c) => (
          <span key={c} className="tag tag-green">
            {CATEGORY_LABELS[c] ?? c}
          </span>
        ))}
      </div>

      {isChannel && resource.url ? (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium"
          style={{
            background: "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)",
          }}
        >
          مشاهدة القناة
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : null}
    </article>
  );
}
