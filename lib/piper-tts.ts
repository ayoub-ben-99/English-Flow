import type { TTSLogic } from "speech-to-speech/tts";

export type VoiceGender = "female" | "male";

export type PiperVoice = {
  id: string;
  /** Arabic display label. */
  arabic: string;
  gender: VoiceGender;
};

/**
 * Real downloadable Piper voices (single-speaker models from the
 * diffusionstudio/piper-voices set). No fake options: every entry here
 * resolves to an actual ONNX model.
 */
export const PIPER_VOICES: PiperVoice[] = [
  { id: "en_US-hfc_female-medium", arabic: "صوت نسائي (HFC)", gender: "female" },
  { id: "en_US-amy-medium", arabic: "صوت نسائي (Amy)", gender: "female" },
  { id: "en_US-hfc_male-medium", arabic: "صوت رجالي (HFC)", gender: "male" },
  { id: "en_US-ryan-medium", arabic: "صوت رجالي (Ryan)", gender: "male" },
];

export const DEFAULT_VOICE_ID = PIPER_VOICES[0].id;

export function isKnownVoiceId(id: unknown): id is string {
  return typeof id === "string" && PIPER_VOICES.some((v) => v.id === id);
}

const instances = new Map<string, Promise<TTSLogic>>();
let liveVoiceId: string | null = null;
// Serializes voice (re)loads so singleton resets can't interleave.
let chain: Promise<unknown> = Promise.resolve();

/**
 * The underlying TtsSession keeps a STATIC singleton: constructing a second
 * voice returns the old session (old model), so without intervention the
 * voice would never change until a page reload. Reset it through a live
 * instance's constructor before initializing a different voice.
 */
function resetUnderlyingSingleton(tts: unknown): void {
  try {
    const session = (
      tts as { ttsSession?: { constructor?: unknown } } | null
    )?.ttsSession;
    const ctor =
      session?.constructor as ({ _instance?: unknown } & object) | undefined;
    if (ctor && typeof ctor === "function" && "_instance" in ctor) {
      (ctor as { _instance: unknown })._instance = null;
    }
  } catch {
    // Best-effort: without the reset the old voice simply keeps playing.
  }
}

async function loadVoice(id: string): Promise<TTSLogic> {
  const hit = instances.get(id);
  if (hit) return hit;

  // Switching voices: drop the old wrapper and reset the library's static
  // session BEFORE initializing, otherwise the old model keeps speaking.
  // (Also unpoisons the static if a previous init failed midway.)
  if (liveVoiceId !== null && liveVoiceId !== id) {
    const old = instances.get(liveVoiceId);
    instances.delete(liveVoiceId);
    if (old) {
      try {
        const oldTts = await old;
        resetUnderlyingSingleton(oldTts);
        try {
          await oldTts.dispose();
        } catch {
          // dispose is best-effort only.
        }
      } catch {
        // The old instance had failed; its own catch already reset.
      }
    }
  }

  const { TTSLogic } = await import("speech-to-speech/tts");
  // One automatic retry: a large first-time model download can occasionally
  // arrive truncated, and the immediate retry then succeeds.
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const tts = new TTSLogic({
      voiceId: id,
      warmUp: true,
      enableWasmCache: true,
      // We play via our own single Audio element (tap-to-stop UX).
      useSharedAudioPlayer: false,
    });
    try {
      await tts.initialize();
      instances.set(id, Promise.resolve(tts));
      liveVoiceId = id;
      return tts;
    } catch (err) {
      lastError = err;
      resetUnderlyingSingleton(tts);
      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
  throw lastError;
}

/**
 * Lazy Piper instance per voice. The first use of a voice downloads the
 * WASM runtime (~9MB, shared/cached) and that voice model (~60MB for
 * medium) in the browser; both are cached afterwards (Cache API + Origin
 * Private File System), so later uses are fast/offline.
 */
export function getPiper(voiceId: string): Promise<TTSLogic> {
  const id = isKnownVoiceId(voiceId) ? voiceId : DEFAULT_VOICE_ID;
  const run = chain.then(() => loadVoice(id));
  // Keep the chain alive across failures; callers still get the rejection.
  chain = run.then(
    () => {},
    () => {},
  );
  return run;
}

/** Synthesize English text to a WAV blob with the given Piper voice. */
export async function synthesizeSpeech(text: string, voiceId: string): Promise<Blob> {
  const tts = await getPiper(voiceId);
  return tts.synthesizeToBlob(text);
}

/**
 * Warm a voice in the background (fire-and-forget). Routes through the same
 * serialized getPiper pipeline the speak button uses, so a prefetch can
 * never download/initialize concurrently with a tap — concurrent model
 * writes were corrupting the cached bytes ("No graph was found in protobuf").
 */
export function prefetchVoice(voiceId: string): void {
  if (!isKnownVoiceId(voiceId)) return;
  void getPiper(voiceId).then(
    () => {},
    () => {
      // Best-effort; a later tap will load on demand.
    },
  );
}
