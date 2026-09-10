import { synthesizeSpeech } from "./piper-tts";
import { getVoiceSettings } from "./voice-settings";

export type PreparedAudio = {
  el: HTMLAudioElement;
  url: string;
};

/**
 * Shared Piper pipeline used by every speak control (word cards and the
 * free-text reader): synthesize with the selected voice, then build an
 * output element with the current volume/speed applied.
 *
 * Settings are read fresh on every call — changing them never reloads the
 * ONNX model and never creates a new session. Returns null when cancelled
 * before completion (no error in that case).
 */
export async function prepareSpokenAudio(
  text: string,
  isCancelled: () => boolean,
): Promise<PreparedAudio | null> {
  const settings = getVoiceSettings();
  const blob = await synthesizeSpeech(text, settings.voice);
  if (isCancelled()) return null;
  const url = URL.createObjectURL(blob);
  const el = new Audio(url);
  // Output-only controls: no model reload, no new session/context.
  el.volume = settings.volume / 100;
  el.playbackRate = settings.speed;
  el.preservesPitch = true;
  return { el, url };
}
