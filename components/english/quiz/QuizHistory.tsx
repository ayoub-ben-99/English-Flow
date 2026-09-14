"use client";

import { RotateCcw, Star, TrendingUp, Trophy, type LucideIcon } from "lucide-react";
import { QuizCollapsible } from "./QuizCollapsible";
import type { ScoreTier, ScoreTierId } from "@/lib/quiz-grade";
import { scoreTierFor } from "@/lib/quiz-grade";
import type { QuizSessionResult } from "@/lib/quiz-history";

/** Expressive icon per tier: trophy / star / trending-up / retry. */
const TIER_ICONS: Record<ScoreTierId, LucideIcon> = {
  excellent: Trophy,
  fair: Star,
  average: TrendingUp,
  bad: RotateCcw,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Past attempts with light translucent tier colors and expressive icons,
 * inside the shared collapsible section (collapsed by default).
 */
export function QuizHistory({ entries }: { entries: QuizSessionResult[] }) {
  if (entries.length === 0) return null;
  return (
    <QuizCollapsible title="محاولات سابقة" count={Math.min(entries.length, 5)} defaultOpen={false}>
      <ul className="flex flex-col gap-2">
        {entries.slice(0, 5).map((entry) => {
          const tier: ScoreTier = scoreTierFor(entry.pct);
          const Icon = TIER_ICONS[tier.id];
          return (
            <li
              key={entry.id}
              data-collapse-item
              className="flex items-center justify-between gap-3 rounded-xl border p-4"
              style={{
                background: `color-mix(in srgb, ${tier.color} 10%, transparent)`,
                borderColor: `color-mix(in srgb, ${tier.color} 35%, transparent)`,
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${tier.color} 18%, transparent)`,
                    color: tier.color,
                  }}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold" dir="ltr">
                    {entry.correct} / {entry.total} ({entry.pct}%)
                  </p>
                  <p className="muted text-sm" dir="ltr">
                    {formatDate(entry.completed_at)}
                  </p>
                </div>
              </div>
              <span
                className="tag shrink-0"
                style={{
                  background: `color-mix(in srgb, ${tier.color} 16%, transparent)`,
                  color: tier.color,
                  fontWeight: 700,
                }}
              >
                {tier.label}
              </span>
            </li>
          );
        })}
      </ul>
    </QuizCollapsible>
  );
}
