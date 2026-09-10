"use client";

import { Gauge, RotateCcw, Settings2, Volume2 } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import "@material/web/slider/slider.js";
import "@material/web/radio/radio.js";
import "@material/web/button/outlined-button.js";
import "@material/web/iconbutton/icon-button.js";
import { PIPER_VOICES, prefetchVoice, type VoiceGender } from "@/lib/piper-tts";
import {
  getVoiceSettings,
  getVoiceSettingsServerSnapshot,
  isDefaultVoiceSettings,
  resetVoiceSettings,
  setVoiceSettings,
  subscribeVoiceSettings,
} from "@/lib/voice-settings";

const GENDER_LABELS: Record<VoiceGender, string> = {
  female: "أصوات نسائية",
  male: "أصوات رجالية",
};

function formatSpeed(speed: number): string {
  return `${parseFloat(speed.toFixed(2))}x`;
}

function sliderValue(target: EventTarget | null): number {
  return Number((target as Element & { value?: number })?.value ?? NaN);
}

/** Voice-output settings in MD3 components (sliders, radios, buttons). */
export function VoiceSettings() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const settings = useSyncExternalStore(
    subscribeVoiceSettings,
    getVoiceSettings,
    getVoiceSettingsServerSnapshot,
  );

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (container.current && !container.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open ]);

  return (
    <div ref={container} className="relative">
      <md-icon-button
        aria-label="إعدادات الصوت"
        title="إعدادات الصوت"
        onClick={() => setOpen((v) => !v)}
        suppressHydrationWarning
      >
        <Settings2 className="h-5 w-5" aria-hidden="true" />
      </md-icon-button>

      {open ? (
        <div
          role="dialog"
          aria-label="إعدادات الصوت"
          className="voice-pop card absolute end-0 top-full z-50 mt-2 w-72 p-4 max-sm:fixed max-sm:inset-x-4 max-sm:top-[4.5rem] max-sm:mt-0 max-sm:w-auto"
        >
          <div className="flex flex-col gap-5">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">الصوت</legend>
              {(Object.keys(GENDER_LABELS) as VoiceGender[]).map((gender) => (
                <div key={gender} className="mb-2 last:mb-0">
                  <p className="muted mb-1 text-xs">{GENDER_LABELS[gender]}</p>
                  <div className="flex flex-col gap-1">
                    {PIPER_VOICES.filter((v) => v.gender === gender).map((v) => (
                      <label
                        key={v.id}
                        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm"
                      >
                        <md-radio
                          name="piper-voice"
                          value={v.id}
                          checked={settings.voice === v.id}
                          aria-label={v.arabic}
                          onChange={() => {
                            setVoiceSettings({ voice: v.id });
                            // Warm the model cache so the first use is fast.
                            prefetchVoice(v.id);
                          }}
                        />
                        <span>{v.arabic}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <p className="muted mt-1 text-xs">
                أول استخدام لصوت جديد يحمّل نموذجه مرة واحدة فقط.
              </p>
            </fieldset>

            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  id="voice-volume-label"
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  مستوى الصوت
                </span>
                <span className="muted text-sm" aria-hidden="true">
                  {settings.volume}%
                </span>
              </div>
              <md-slider
                aria-labelledby="voice-volume-label"
                min={0}
                max={100}
                step={1}
                value={settings.volume}
                valueLabel={`${settings.volume}%`}
                onInput={(e) => {
                  const next = sliderValue(e.target);
                  if (Number.isFinite(next)) setVoiceSettings({ volume: next });
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  id="voice-speed-label"
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  <Gauge className="h-4 w-4" aria-hidden="true" />
                  السرعة
                </span>
                <span className="muted text-sm" dir="ltr" aria-hidden="true">
                  {formatSpeed(settings.speed)}
                </span>
              </div>
              <md-slider
                aria-labelledby="voice-speed-label"
                min={0.75}
                max={2}
                step={0.05}
                value={settings.speed}
                valueLabel={formatSpeed(settings.speed)}
                onInput={(e) => {
                  const next = sliderValue(e.target);
                  if (Number.isFinite(next)) setVoiceSettings({ speed: next });
                }}
              />
            </div>

            <md-outlined-button
              disabled={isDefaultVoiceSettings(settings)}
              onClick={() => resetVoiceSettings()}
            >
              <span className="inline-flex items-center gap-2">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                إعادة الافتراضي
              </span>
            </md-outlined-button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
