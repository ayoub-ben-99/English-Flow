"use client";

import { useEffect } from "react";
import { ReaderPanel } from "@/components/english/audio/ReaderPanel";
import { toast } from "sonner";

let voiceModelLoaded = false;

function showLoadingToast() {
  if (voiceModelLoaded) return;
  toast.loading("جاري تحميل نموذج الصوت للمرة الأولى...", {
    id: "piper-loading",
    description: "قد يستغرق ذلك بضع ثوانٍ (~60 ميجابايت).",
    duration: Infinity,
  });
}

function showSuccessToast() {
  toast.success("تم تحميل نموذج الصوت بنجاح!", {
    id: "piper-loading",
    description: "يمكنك الآن الاستماع لأي نص فوراً.",
    duration: 4000,
  });
  voiceModelLoaded = true;
}

function showErrorToast() {
  toast.error("فشل تحميل نموذج الصوت", {
    id: "piper-loading",
    description: "يرجى تحديث الصفحة والمحاولة مرة أخرى.",
    action: {
      label: "إعادة تحميل",
      onClick: () => window.location.reload(),
    },
    duration: Infinity,
  });
}

export default function ListenPage() {
  useEffect(() => {
    const handleStart = () => showLoadingToast();
    const handleSuccess = () => showSuccessToast();
    const handleError = () => showErrorToast();

    window.addEventListener("piper-loading-start", handleStart);
    window.addEventListener("piper-loading-success", handleSuccess);
    window.addEventListener("piper-loading-error", handleError);

    return () => {
      window.removeEventListener("piper-loading-start", handleStart);
      window.removeEventListener("piper-loading-success", handleSuccess);
      window.removeEventListener("piper-loading-error", handleError);
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">الاستماع الحر</h1>
      <p className="muted mt-2">
        اكتب أي نص إنجليزي واستمع إليه بالصوت والسرعة اللذين تختارهما.
      </p>
      <div className="mt-16">
        <ReaderPanel />
      </div>
    </div>
  );
}
