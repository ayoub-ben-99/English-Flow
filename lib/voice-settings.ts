/**
 * Voice output settings (volume + speed).
 *
 * Applied on the output <audio> element at playback time only — changing
 * them never reloads the ONNX model and never creates a new session.
 *
 * Deliberately NOT included:
 * - Gender/speaker: the Piper stack hardcodes `speakerId = 0` and the
 *   `en_US-hfc_female-medium` voice model is single-speaker, so a gender
 *   switch would be fake UI.
 * - Pitch: Piper inference exposes noise/length scales but no pitch
 *   parameter, and faking it via playbackRate would couple it with speed.
 */
import { DEFAULT_VOICE_ID, isKnownVoiceId } from "./piper-tts";

export type VoiceSettings = {
  /** 0–100. Applied as HTMLAudioElement.volume. */
  volume: number;
  /** 0.75–2. Applied as HTMLAudioElement.playbackRate (pitch preserved). */
  speed: number;
  /** Piper voice model id (see PIPER_VOICES — always a real model). */
  voice: string;
};

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = Object.freeze({
  volume: 100,
  speed: 1,
  voice: DEFAULT_VOICE_ID,
});

const STORAGE_KEY = "voice-settings";
const MIN_SPEED = 0.75;
const MAX_SPEED = 2;

const listeners = new Set<() => void>();
let current: VoiceSettings = { ...DEFAULT_VOICE_SETTINGS };
let loaded = false;

function clampVolume(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 100;
  return Math.min(100, Math.max(0, n));
}

function clampSpeed(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 1;
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, n));
}

function ensureLoaded(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return;
    const p = parsed as Partial<VoiceSettings>;
    current = {
      volume: clampVolume(p.volume),
      speed: clampSpeed(p.speed),
      voice: isKnownVoiceId(p.voice) ? p.voice : DEFAULT_VOICE_ID,
    };
  } catch {
    // Corrupt storage — keep defaults.
  }
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function getVoiceSettings(): VoiceSettings {
  ensureLoaded();
  return current;
}

/** Server snapshot for useSyncExternalStore (must match SSR output). */
export function getVoiceSettingsServerSnapshot(): VoiceSettings {
  return DEFAULT_VOICE_SETTINGS;
}

export function subscribeVoiceSettings(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function setVoiceSettings(patch: Partial<VoiceSettings>): void {
  ensureLoaded();
  const next: VoiceSettings = {
    volume: patch.volume === undefined ? current.volume : clampVolume(patch.volume),
    speed: patch.speed === undefined ? current.speed : clampSpeed(patch.speed),
    voice: patch.voice === undefined || !isKnownVoiceId(patch.voice) ? current.voice : patch.voice,
  };
  if (
    next.volume === current.volume &&
    next.speed === current.speed &&
    next.voice === current.voice
  )
    return;
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage unavailable — settings still apply for this session.
  }
  notify();
}

export function resetVoiceSettings(): void {
  setVoiceSettings({ ...DEFAULT_VOICE_SETTINGS });
}

export function isDefaultVoiceSettings(settings: VoiceSettings): boolean {
  return (
    settings.volume === DEFAULT_VOICE_SETTINGS.volume &&
    settings.speed === DEFAULT_VOICE_SETTINGS.speed &&
    settings.voice === DEFAULT_VOICE_SETTINGS.voice
  );
}
