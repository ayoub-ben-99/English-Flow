import type { FinalWord } from "@/lib/pipeline-words";
import { CompleteButton } from "../progress/CompleteButton";
import { LevelBadge } from "../ui/LevelBadge";
import { SpeakButton } from "../audio/SpeakButton";

const POS_LABELS: Record<string, string> = {
  noun: "اسم",
  verb: "فعل",
  adjective: "صفة",
  adverb: "حال",
  phrase: "عبارة",
};

/** Curriculum word card: always fully translated with CEFR level. */
export function WordCard({ word, categoryName }: { word: FinalWord; categoryName: string }) {
  return (
    <article className="card flex flex-col gap-2 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold" dir="ltr" lang="en">
            {word.word}
          </h2>
          <p className="card-ink mt-1 text-lg">{word.translation}</p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <CompleteButton section="terms" id={word.sourceId} label={word.word} />
          <SpeakButton text={word.word} label={`Listen to ${word.word}`} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LevelBadge level={word.cefrLevel} />
        <span className="tag tag-purple">{categoryName}</span>
        {POS_LABELS[word.partOfSpeech] ? (
          <span className="tag tag-green">{POS_LABELS[word.partOfSpeech]}</span>
        ) : null}
      </div>

      {word.definition ? (
        <p className="card-ink mt-1 text-sm" dir="ltr" lang="en">
          · {word.definition}
        </p>
      ) : null}

      {word.exampleSentence ? (
        <p
          className="muted mt-1 border-t pt-3 text-sm"
          dir="ltr"
          lang="en"
          style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
        >
          {word.exampleSentence}
        </p>
      ) : null}
    </article>
  );
}
