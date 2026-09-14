import type { Term } from "@/types/english";
import { CompleteButton } from "../progress/CompleteButton";
import { LevelBadge } from "../ui/LevelBadge";
import { SpeakButton } from "../audio/SpeakButton";

type TermCardProps = {
  term: Term;
  categoryName: string;
  /** CEFR level mapped from the CEFR-J profile (shown only when known). */
  cefrLevel?: string | null;
};

export function TermCard({ term, categoryName, cefrLevel }: TermCardProps) {
  return (
    <article className="card flex flex-col gap-2 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold" dir="ltr" lang="en">
            {term.english}
          </h2>
          <p className="card-ink mt-1 text-lg">{term.arabic}</p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <CompleteButton section="terms" id={term.id} label={term.english} />
          <SpeakButton text={term.english} label={`Listen to ${term.english}`} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="tag tag-purple">{categoryName}</span>
        {cefrLevel ? <LevelBadge level={cefrLevel} /> : null}
        {term.pronunciation ? (
          <span className="muted text-sm" dir="ltr" lang="en">
            /{term.pronunciation}/
          </span>
        ) : null}
      </div>

      {term.example ? (
        <p
          className="muted mt-1 border-t pt-3 text-sm"
          dir="ltr"
          lang="en"
          style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
        >
          {term.example}
        </p>
      ) : null}
    </article>
  );
}
