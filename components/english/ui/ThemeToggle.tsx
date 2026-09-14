"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

/**
 * Single theme toggle button (as before): switches explicitly between
 * light and dark only — no system/auto option.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "التبديل إلى المظهر الفاتح" : "التبديل إلى المظهر الداكن"}
      aria-pressed={dark}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors"
      style={{
        border: "1px solid var(--md-sys-color-outline-variant)",
        color: "var(--muted)",
      }}
    >
      {dark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
