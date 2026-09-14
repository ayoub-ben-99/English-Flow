"use client";

import { AudioLines, BookOpen, Languages, Library, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const ENGLISH_LINKS = [
  { href: "/english/terms", arabic: "المفردات", english: "Terms", Icon: BookOpen },
  { href: "/english/grammar", arabic: "القواعد", english: "Grammar", Icon: Languages },
  { href: "/english/sentences", arabic: "الجمل", english: "Sentences", Icon: MessageSquare },
  { href: "/english/listen", arabic: "الاستماع الحر", english: "Listen", Icon: AudioLines },
  { href: "/english/resources", arabic: "مصادر التعلم", english: "Resources", Icon: Library },
];

const links = ENGLISH_LINKS;

/**
 * Single navigation used for both layouts:
 * vertical sidebar on desktop, horizontal scroll bar on mobile.
 */
export function EnglishNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="أقسام تعلم الإنجليزية"
      className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible"
    >
      {links.map(({ href, arabic, english, Icon }) => {
        const active =
          pathname === href || (href !== "/english" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap"
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
  );
}
