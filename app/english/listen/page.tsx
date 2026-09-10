import { ReaderPanel } from "@/components/english/ReaderPanel";

export default function ListenPage() {
  return (
    <div>
      <h1 className="text-3xl  font-semibold tracking-tight">الاستماع الحر</h1>
      <p className="muted mt-2">
        اكتب أي نص إنجليزي واستمع إليه بالصوت والسرعة اللذين تختارهما.
      </p>
      <div className="mt-16">
        <ReaderPanel />
      </div>
    </div>
  );
}
