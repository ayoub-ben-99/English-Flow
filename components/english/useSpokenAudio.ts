"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prepareSpokenAudio } from "@/lib/speak-text";

export type SpeakStatus = "idle" | "loading" | "ready" | "speaking" | "error";

/**
 * Shared speak state machine (tap = speak, tap again = stop, slow first
 * download keeps audio ready for one more tap instead of failing silently).
 * Used by SpeakButton (word cards) and ReaderPanel (free text) alike.
 */
export function useSpokenAudio() {
  const [status, setStatus] = useState<SpeakStatus>("idle");
  const mounted = useRef(true);
  const cancelled = useRef(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelled.current = true;
      audio.current?.pause();
      audio.current = null;
      if (objectUrl.current) {
        URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = null;
      }
    };
  }, []);

  const releaseAudio = useCallback(() => {
    audio.current?.pause();
    audio.current = null;
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
  }, []);

  const playCurrent = useCallback(async (): Promise<boolean> => {
    const el = audio.current;
    if (!el) return false;
    try {
      await el.play();
      return true;
    } catch {
      return false;
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (status === "loading") {
        // Cancel the in-flight download/synthesis.
        cancelled.current = true;
        releaseAudio();
        setStatus("idle");
        return;
      }
      if (status === "speaking") {
        releaseAudio();
        setStatus("idle");
        return;
      }
      if (status === "ready") {
        // Blob is already in memory — replay within a fresh click gesture.
        void playCurrent().then((ok) => {
          if (!mounted.current) return;
          setStatus(ok ? "speaking" : "error");
        });
        return;
      }
      // idle | error → synthesize with the selected Piper voice.
      cancelled.current = false;
      setStatus("loading");
      void (async () => {
        try {
          const prepared = await prepareSpokenAudio(
            text,
            () => cancelled.current || !mounted.current,
          );
          if (!prepared || cancelled.current || !mounted.current) return;
          releaseAudio();
          objectUrl.current = prepared.url;
          audio.current = prepared.el;
          const el = prepared.el;
          el.onended = () => {
            releaseAudio();
            if (mounted.current) setStatus("idle");
          };
          el.onerror = () => {
            releaseAudio();
            if (mounted.current) setStatus("error");
          };
          const played = await playCurrent();
          if (cancelled.current || !mounted.current) {
            releaseAudio();
            return;
          }
          // play() can be rejected when the click gesture expired during the
          // (slow, first-time) model download — keep audio ready for a tap.
          setStatus(played ? "speaking" : "ready");
        } catch {
          releaseAudio();
          if (mounted.current && !cancelled.current) setStatus("error");
        }
      })();
    },
    [status, releaseAudio, playCurrent],
  );

  return { status, speak };
}
