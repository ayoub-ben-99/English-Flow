/**
 * Quiz date helpers. All dates are ISO calendar days (YYYY-MM-DD, UTC) so
 * `next_review_at <= today` comparisons are plain string comparisons with
 * no timezone ambiguity.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time);
}

/** Today's UTC calendar day as YYYY-MM-DD. */
export function todayUtcDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Add whole days to an ISO date, returning an ISO date. */
export function addDaysUtc(date: string, days: number): string {
  const time = Date.parse(`${date}T00:00:00Z`);
  const base = Number.isFinite(time) ? time : Date.parse(`${todayUtcDate()}T00:00:00Z`);
  return new Date(base + Math.max(0, Math.round(days)) * 86_400_000).toISOString().slice(0, 10);
}

/** Whether a word with this `next_review_at` is due today or overdue. */
export function isDue(nextReviewAt: string, today: string): boolean {
  return nextReviewAt <= today;
}
