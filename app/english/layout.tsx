import type { Metadata } from "next";
import Link from "next/link";
import { EnglishNav } from "@/components/english/EnglishNav";
import { MobileNav } from "@/components/english/MobileNav";
import { SiteLogo } from "@/components/english/SiteLogo";
import { ThemeToggle } from "@/components/english/ThemeToggle";
import { VoiceSettings } from "@/components/english/VoiceSettings";
import { ToastProvider } from "@/components/english/ToastProvider";

export const metadata: Metadata = {
  title: "تعلم الإنجليزية",
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <header
        className="flex h-16 items-center justify-between border-b"
        style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
      >
        <Link href="/english" className="flex min-w-0 items-center gap-2 text-lg font-semibold">
          <span className="shrink-0" style={{ color: "var(--md-sys-color-primary)" }}>
            <SiteLogo className="h-8 w-8" />
          </span>
          <span className="truncate">تعلم الإنجليزية</span>
        </Link>
        <div className="flex items-center gap-2">
          <VoiceSettings />
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>

      <div className="grid gap-6 py-6 md:grid-cols-[220px_1fr] md:py-8">
        <aside className="hidden min-w-0 md:sticky md:top-6 md:block md:self-start">
          <EnglishNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
      <ToastProvider />
    </div>
  );
}
