import { Suspense } from "react";
import { QuizRunner } from "@/components/english/quiz/QuizRunner";

export default function QuizPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">اختبار المفردات</h1>
      <p className="muted mt-2">
        اختبر الكلمات التي أكّدتها — الكلمات المتأخرة والخاطئة تظهر أولاً.
      </p>
      <Suspense>
        <QuizRunner />
      </Suspense>
    </div>
  );
}
