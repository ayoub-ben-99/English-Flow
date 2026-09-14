const LEVEL_STYLES: Record<string, { bg: string; fg: string }> = {
  A1: { bg: "var(--notion-mint)", fg: "var(--tag-green-ink)" },
  A2: { bg: "var(--notion-sky)", fg: "var(--level-blue-ink)" },
  B1: { bg: "var(--notion-yellow-bold)", fg: "var(--level-amber-ink)" },
  B2: { bg: "var(--notion-peach)", fg: "var(--level-orange-ink)" },
  C1: { bg: "var(--notion-rose)", fg: "var(--level-rose-ink)" },
  C2: {
    bg: "var(--md-sys-color-primary-container)",
    fg: "var(--md-sys-color-on-primary-container)",
  },
};

/** Color-coded CEFR level badge (A1 green → C2 purple). */
export function LevelBadge({ level }: { level: string }) {
  const style = LEVEL_STYLES[level] ?? {
    bg: "var(--md-sys-color-surface-container-high)",
    fg: "var(--muted)",
  };
  return (
    <span className="tag" style={{ background: style.bg, color: style.fg }} dir="ltr">
      {level}
    </span>
  );
}

/**
 * Distinctive level-chip styling for the level filter: every level always
 * wears its own colors; the active one adds a ring + is announced via
 * aria-pressed (never color alone).
 */
export function levelChipStyle(level: string, active: boolean): React.CSSProperties {
  const style = LEVEL_STYLES[level] ?? {
    bg: "var(--md-sys-color-surface-container-high)",
    fg: "var(--muted)",
  };
  return {
    background: style.bg,
    color: style.fg,
    fontWeight: active ? 700 : 500,
    boxShadow: active ? `inset 0 0 0 2px ${style.fg}` : "none",
  };
}
