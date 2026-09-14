import { Sigma } from "lucide-react";
import type { GrammarTopic } from "@/types/english";
import { CompleteButton } from "./CompleteButton";
import { SpeakButton } from "./SpeakButton";

type GrammarCardProps = {
  topic: GrammarTopic;
  categoryName: string;
};

export function GrammarCard({ topic, categoryName }: GrammarCardProps) {
  return (
    <article className="card flex flex-col gap-3 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="tag tag-purple">{categoryName}</span>
          <h2 className="mt-2 text-xl font-semibold">
            {topic.arabicTitle}{" "}
            <span className="muted text-base font-normal" dir="ltr" lang="en">
              · {topic.title}
            </span>
          </h2>
          <p className="card-ink mt-1 text-sm">{topic.description}</p>
        </div>
        <CompleteButton section="grammar" id={topic.id} label={topic.arabicTitle} />
      </div>

      {topic.formula ? (
        <p
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          dir="ltr"
          lang="en"
          style={{ background: "var(--md-sys-color-surface-container)" }}
        >
          <Sigma
            className="h-4 w-4 shrink-0"
            style={{ color: "var(--md-sys-color-primary)" }}
            aria-hidden="true"
          />
          <span>{topic.formula}</span>
        </p>
      ) : null}

      {topic.examples.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {topic.examples.map((ex, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-3 border-t pt-3"
              style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
            >
              <div className="min-w-0">
                <p dir="ltr" lang="en">
                  {ex.english}
                </p>
                <p className="muted mt-0.5 text-sm">{ex.arabic}</p>
              </div>
              <SpeakButton
                text={ex.english}
                label={`Listen to example: ${ex.english}`}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
