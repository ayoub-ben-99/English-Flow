import { CompleteButton } from "./CompleteButton";
import { LevelBadge } from "./LevelBadge";
import { SpeakButton } from "./SpeakButton";

export type PipelineGrammarTopic = {
  id: string;
  topic: string;
  cefrLevel: string;
  sentenceType?: string | null;
  explanation?: string | null;
  examples?: { english: string; arabic: string }[];
};

/** CEFR-J topic with curated Arabic explanation, voiced examples. */
export function GrammarTopicCard({ topic }: { topic: PipelineGrammarTopic }) {
  return (
    <article className="card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold" dir="ltr" lang="en">
            {topic.topic}
          </h2>
          {topic.sentenceType ? (
            <p className="muted mt-0.5 text-xs" dir="ltr" lang="en">
              {topic.sentenceType}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <CompleteButton section="grammar" id={topic.id} label={topic.topic} />
          <SpeakButton text={topic.topic} label={`Listen to ${topic.topic}`} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LevelBadge level={topic.cefrLevel} />
      </div>

      {topic.explanation ? (
        <p className="card-ink text-sm leading-relaxed">{topic.explanation}</p>
      ) : null}

      {topic.examples && topic.examples.length > 0 ? (
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
