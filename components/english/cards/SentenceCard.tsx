import type { Sentence } from "@/types/english";
import { CompleteButton } from "../progress/CompleteButton";
import { LevelBadge } from "../ui/LevelBadge";
import { SpeakButton } from "../audio/SpeakButton";

type SentenceCardProps = {
  sentence: Sentence & { cefrLevel?: string; grammarTopic?: string | null };
  categoryName: string;
};

export function SentenceCard({ sentence, categoryName }: SentenceCardProps) {
  return (
    <article className="card flex items-start justify-between gap-3 p-5">
      <div className="min-w-0">
        <p className="text-lg font-medium" dir="ltr" lang="en">
          {sentence.english}
        </p>
        <p className="card-ink mt-1">{sentence.arabic}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {sentence.cefrLevel ? <LevelBadge level={sentence.cefrLevel} /> : null}
          <span className="tag tag-purple inline-block">
            {categoryName}
          </span>
          {sentence.grammarTopic ? (
            <span className="muted text-xs" dir="ltr" lang="en">
              {sentence.grammarTopic}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-start gap-2">
        <CompleteButton section="sentences" id={sentence.id} label={sentence.english} />
        <SpeakButton
          text={sentence.english}
          label={`Listen to sentence: ${sentence.english}`}
        />
      </div>
    </article>
  );
}
