"use client";

import { Loader2, Volume2, VolumeX } from "lucide-react";
import { useSpokenAudio, type SpeakStatus } from "../hooks/useSpokenAudio";

type SpeakButtonProps = {
  /** English text to pronounce. */
  text: string;
  /** Accessible label, e.g. "Listen to Apple". */
  label: string;
};

/**
 * Pronunciation button backed by local Piper TTS (WASM/ONNX):
 * Apple 🔊 → Piper TTS → WASM/ONNX → Audio.
 *
 * Playback runs through the shared useSpokenAudio pipeline (same as the
 * free-text reader): first tap downloads the voice model (~60MB, cached
 * afterwards) and shows a loading state.
 */
export function SpeakButton({ text, label }: SpeakButtonProps) {
  const { status, speak } = useSpokenAudio();

  const titles: Record<SpeakStatus, string> = {
    idle: label,
    loading: "جارٍ تحميل الصوت لأول مرة… اضغط للإلغاء",
    ready: "الصوت جاهز — اضغط للتشغيل",
    speaking: "إيقاف",
    error: "تعذر تشغيل الصوت — اضغط للمحاولة مجدداً",
  };
  const liveMessage =
    status === "loading"
      ? "جارٍ تحميل الصوت لأول مرة"
      : status === "speaking"
        ? "جارٍ النطق"
        : status === "ready"
          ? "الصوت جاهز للتشغيل"
          : status === "error"
            ? "تعذر تشغيل الصوت"
            : "";

  return (
    <>
      <button
        type="button"
        onClick={() => speak(text)}
        aria-label={status === "idle" ? label : titles[status]}
        aria-pressed={status === "speaking"}
        title={titles[status]}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors"
        style={
          status === "speaking" || status === "ready"
            ? {
                background: "var(--md-sys-color-primary-container)",
                color: "var(--md-sys-color-on-primary-container)",
              }
            : status === "error"
              ? {
                  border: "1px solid var(--danger)",
                  color: "var(--danger)",
                }
              : {
                  border: "1px solid var(--md-sys-color-outline-variant)",
                  color: "var(--muted)",
                }
        }
      >
        {status === "loading" ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : status === "error" ? (
          <VolumeX className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Volume2 className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
    </>
  );
}
