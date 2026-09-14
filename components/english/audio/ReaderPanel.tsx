"use client";

import { useState, useSyncExternalStore } from "react";
import { AudioLines, Eraser, Info, Loader2, Play, Square } from "lucide-react";
import { PIPER_VOICES } from "@/lib/piper-tts";
import {
  getVoiceSettings,
  getVoiceSettingsServerSnapshot,
  subscribeVoiceSettings,
} from "@/lib/voice-settings";
import { useSpokenAudio } from "../hooks/useSpokenAudio";
import { VoiceSettings } from "./VoiceSettings";

const MAX_CHARS = 500;

const SAMPLES = [
  "Good morning! How are you today?",
  "Could you please speak more slowly?",
  "Practice a little English every single day.",
];

/** Live "voice · speed" status row reflecting the output settings. */
function VoiceSummary() {
  const settings = useSyncExternalStore(
    subscribeVoiceSettings,
    getVoiceSettings,
    getVoiceSettingsServerSnapshot,
  );
  const voice = PIPER_VOICES.find((v) => v.id === settings.voice);
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 my-4"
      style={{ background: "var(--md-sys-color-surface-container)" }}
      aria-live="polite"
    >
      <AudioLines
        className="h-4 w-4 shrink-0"
        style={{ color: "var(--md-sys-color-primary)" }}
        aria-hidden="true"
      />
      <p className="text-xs">
        <span className="font-semibold">{voice?.arabic ?? "الافتراضي"}</span>
        <span className="muted"> · السرعة </span>
        <span className="tag tag-purple" dir="ltr">
          {parseFloat(settings.speed.toFixed(2))}x
        </span>
      </p>
    </div>
  );
}

const SAMPLE_TINTS = [
  "var(--notion-mint)",
  "var(--notion-sky)",
  "var(--notion-lavender)",
];

/**
 * Sidebar free-text reader: type any English text and hear it with the
 * selected voice. Runs on the exact same pipeline as the word cards
 * (useSpokenAudio → Piper), and reuses the VoiceSettings panel for
 * voice/volume/speed selection — no duplicated controls or logic.
 */
export function ReaderPanel() {
  const [text, setText] = useState("");
  const { status, speak } = useSpokenAudio();
  const trimmed = text.trim();
  const canSpeak = trimmed.length > 0 && status !== "loading";

  const buttonLabel =
    status === "loading"
      ? "إلغاء التحميل"
      : status === "speaking"
        ? "إيقاف النطق"
        : status === "ready"
          ? "تشغيل الصوت"
          : status === "error"
            ? "حاول مجدداً"
            : "استمع للنص";

  const liveMessage =
    status === "loading"
      ? "جارٍ تحميل الصوت"
      : status === "speaking"
        ? "جارٍ نطق النص"
        : status === "ready"
          ? "الصوت جاهز للتشغيل"
          : status === "error"
            ? "تعذر تشغيل الصوت"
            : "";

  return (
    <section aria-labelledby="reader-title" className="card p-4 sm:p-6 w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2
          id="reader-title"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <AudioLines
            className="h-4 w-4"
            style={{ color: "var(--md-sys-color-primary)" }}
            aria-hidden="true"
          />
          اقرأ نصاً
        </h2>
        <VoiceSettings />
      </div>

      <div className="flex flex-wrap gap-2" aria-label="نصوص جاهزة للتجربة">
        {SAMPLES.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setText(s);
              speak(s);
            }}
            title={s}
            className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
            style={{
              background: SAMPLE_TINTS[i % SAMPLE_TINTS.length],
              color: "var(--card-ink)",
            }}
          >
            <Play className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span dir="ltr" lang="en" className="truncate">
              {s.length > 32 ? `${s.slice(0, 32)}…` : s}
            </span>
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="reader-text"
          className="my-4 block text-sm font-medium"
        >
          النص الإنجليزي
        </label>
        <textarea
          id="reader-text"
          rows={3}
          maxLength={MAX_CHARS}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type any English text…"
          dir="ltr"
          lang="en"
          aria-describedby="reader-help reader-count"
          className="w-full resize-y rounded-lg p-3 text-base"
          style={{
            background: "var(--md-sys-color-surface)",
            border: "1px solid var(--md-sys-color-outline)",
            color: "var(--md-sys-color-on-surface)",
          }}
        />
        <div className="mt-1 flex items-center justify-between gap-2">
          <p id="reader-help" className="muted flex items-center gap-1.5 text-xs">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            اكتب جملة قصيرة ثم اضغط استمع — حتى 500 حرف.
          </p>
          <span
            id="reader-count"
            dir="ltr"
            aria-hidden="true"
            className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={
              trimmed.length >= MAX_CHARS
                ? { color: "var(--danger)", border: "1px solid var(--danger)" }
                : trimmed.length >= 450
                  ? { background: "var(--notion-yellow-bold)", color: "var(--level-amber-ink)" }
                  : { background: "var(--md-sys-color-surface-container-high)", color: "var(--muted)" }
            }
          >
            {trimmed.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      <VoiceSummary />

      <div className="mt-1 flex items-center justify-between gap-2">
        {trimmed ? (
          <button
            type="button"
            onClick={() => setText("")}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
            مسح
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => speak(trimmed)}
          disabled={!canSpeak}
          aria-label={trimmed ? buttonLabel : "اكتب نصاً أولاً"}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)",
          }}
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : status === "speaking" ? (
            <Square className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
          {buttonLabel}
        </button>
      </div>

      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
    </section>
  );
}
