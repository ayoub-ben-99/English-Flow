import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div
      className="card flex flex-col items-center gap-2 p-10 text-center"
      role="status"
    >
      <SearchX
        className="muted h-8 w-8"
        aria-hidden="true"
      />
      <p className="font-semibold">{title}</p>
      {hint ? <p className="muted text-sm">{hint}</p> : null}
    </div>
  );
}
