"use client";

import { Check } from "lucide-react";
import { isComplete, toggleComplete, useCompletedIds, type ProgressSection } from "@/lib/progress";

type CompleteButtonProps = {
  section: ProgressSection;
  id: string;
  /** Item name for the accessible label. */
  label: string;
};

/** Toggle an item as learned: outline → green filled state. */
export function CompleteButton({ section, id, label }: CompleteButtonProps) {
  // Subscribe so the button re-renders when progress changes elsewhere.
  useCompletedIds(section);
  const done = isComplete(section, id);

  return (
    <button
      type="button"
      onClick={() => toggleComplete(section, id)}
      aria-label={done ? `إلغاء إنجاز "${label}"` : `تحديد "${label}" كمُنجز`}
      aria-pressed={done}
        title={done ? "مُنجز — اضغط للإلغاء" : "تحديد كمُنجز"}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors transition-transform active:scale-90"
      style={
        done
          ? {
              background: "var(--notion-mint)",
              color: "var(--tag-green-ink)",
              border: "1px solid var(--tag-green-ink)",
            }
          : {
              background: "transparent",
              color: "var(--muted)",
              border: "1px solid var(--md-sys-color-outline-variant)",
            }
      }
    >
      {/* key remount replays the pop on every toggle without losing focus */}
      <span key={done ? "done" : "todo"} className={done ? "complete-pop" : undefined}>
        <Check className="h-5 w-5" aria-hidden="true" strokeWidth={done ? 3 : 2} />
      </span>
    </button>
  );
}
