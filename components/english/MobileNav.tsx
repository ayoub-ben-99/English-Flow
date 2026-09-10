"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ENGLISH_LINKS } from "./EnglishNav";

// Note: the menu closes via onClick on every link (covers all navigation);
// no route-change effect needed.

/**
 * Mobile navigation: hamburger button in the navbar opening a dropdown
 * panel (top-to-bottom expand + fade, same motion language as filters).
 * Desktop keeps the sidebar; this renders nothing on md+.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open ]);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors"
        style={{
          border: "1px solid var(--md-sys-color-outline-variant)",
          color: "var(--muted)",
        }}
      >
        <span
          className="inline-flex transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
      </button>

      <div
        id={panelId}
        className={`cat-panel${open ? " cat-open" : ""} absolute end-0 top-full z-50 mt-2 w-64`}
      >
        <div className="cat-panel-inner">
          <nav
            aria-label="أقسام تعلم الإنجليزية"
            aria-hidden={!open}
            className="card flex flex-col gap-1 p-2"
          >
            {ENGLISH_LINKS.map(({ href, arabic, english, Icon }) => {
              const active =
                pathname === href ||
                (href !== "/english" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  tabIndex={open ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium"
                  style={
                    active
                      ? {
                          background: "var(--md-sys-color-primary-container)",
                          color: "var(--md-sys-color-on-primary-container)",
                          fontWeight: 600,
                        }
                      : { color: "var(--muted)" }
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{arabic}</span>
                  <span className="text-xs opacity-70" dir="ltr">
                    {english}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
