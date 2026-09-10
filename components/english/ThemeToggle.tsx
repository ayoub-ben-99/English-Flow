"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const THEME_EVENT = "roadmap-theme-change";

function readDark(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark"
  );
}

/** Server snapshot must match SSR HTML (no data-theme attribute server-side). */
function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute(
    "data-theme",
    dark ? "dark" : "light",
  );
  try {
    localStorage.setItem("roadmap-theme", dark ? "dark" : "light");
  } catch {
    // Storage unavailable — theme still applies for this session.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function ThemeToggle() {
  // External-store read: hydrates with the server snapshot, then syncs to
  // the real theme without a hydration mismatch.
  const dark = useSyncExternalStore(subscribe, readDark, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => applyTheme(!dark)}
      aria-label="تبديل المظهر فاتح / داكن"
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
