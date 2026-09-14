"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const nextTheme = (() => {
    if (theme === "light") return "dark";
    if (theme === "dark") return "system";
    return "light";
  })();

  const icons = {
    light: <Sun className="h-5 w-5" aria-hidden="true" />,
    dark: <Moon className="h-5 w-5" aria-hidden="true" />,
    system: <Monitor className="h-5 w-5" aria-hidden="true" />,
  };

  const labels = {
    light: "المظهر: فاتح — اضغط للداكن",
    dark: "المظهر: داكن — اضغط للنظام",
    system: "المظهر: نظام — اضغط للفاتح",
  };

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={labels[theme]}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors"
      style={{
        border: "1px solid var(--md-sys-color-outline-variant)",
        color: "var(--muted)",
      }}
    >
      {icons[theme]}
    </button>
  );
}