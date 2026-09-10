import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 inline-flex items-center justify-center rounded-full p-4" style={{ background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-on-primary-container)" }}>
          <Search className="h-12 w-12" aria-hidden="true" />
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight" style={{ color: "var(--md-sys-color-on-surface)" }}>
          الصفحة غير موجودة
        </h1>
        <p className="mb-8 text-lg" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
          لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون الروابط قديمة أو تمت إزالة الصفحة.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium transition-colors"
            style={{
              background: "var(--md-sys-color-primary)",
              color: "var(--md-sys-color-on-primary)",
            }}
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            العودة للرئيسية
          </Link>
          <Link
            href="/english"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-base font-medium transition-colors"
            style={{
              borderColor: "var(--md-sys-color-outline-variant)",
              color: "var(--md-sys-color-on-surface)",
            }}
          >
            قسم تعلم الإنجليزية
          </Link>
        </div>
      </div>
    </div>
  );
}