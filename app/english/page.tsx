import { AudioLines, BookOpen, ChevronLeft, GraduationCap, Languages, Library, MessageSquare } from "lucide-react";
import Link from "next/link";
import { HomeProgress } from "@/components/english/progress/HomeProgress";
import { Reveal } from "@/components/english/motion/Reveal";
import { getGrammarTopics } from "@/lib/pipeline-grammar";
import { getSentences } from "@/lib/pipeline-sentences";
import { getWords } from "@/lib/pipeline-words";

export default async function EnglishHomePage() {
  const [{ total: sentenceTotal }, { total: wordTotal }, { total: grammarTotal }] =
    await Promise.all([getSentences({}), getWords({}), getGrammarTopics({})]);
  const sections = [
    {
      href: "/english/terms",
      Icon: BookOpen,
      title: "المفردات",
      description: "كلمات شائعة مع الترجمة والنطق والأمثلة.",
      count: wordTotal,
      countLabel: "كلمة",
      tint: "tint-mint",
    },
    {
      href: "/english/grammar",
      Icon: Languages,
      title: "القواعد",
      description: "شروحات مبسطة مع الصيغ والأمثلة المنطوقة.",
      count: grammarTotal,
      countLabel: "موضوع",
      tint: "tint-lavender",
    },
    {
      href: "/english/sentences",
      Icon: MessageSquare,
      title: "الجمل",
      description: "جمل عملية للحياة اليومية مع النطق.",
      count: sentenceTotal,
      countLabel: "جملة",
      tint: "tint-sky",
    },
    {
      href: "/english/quiz",
      Icon: GraduationCap,
      title: "الاختبار",
      description: "اختبر كلماتك المؤكدة — المتأخرة والخاطئة تظهر أولاً.",
      count: null,
      countLabel: "اختبار تفاعلي",
      tint: "tint-yellow-bold",
    },
    {
      href: "/english/listen",
      Icon: AudioLines,
      title: "الاستماع الحر",
      description: "اكتب أي نص واستمع إليه بصوتك المختار.",
      count: null,
      countLabel: "نص حر",
      tint: "tint-rose",
    },
    {
      href: "/english/resources",
      Icon: Library,
      title: "مصادر التعلم",
      description: "قنوات وكتب مختارة حسب مستواك.",
      count: 15,
      countLabel: "مصدر",
      tint: "tint-cream",
    },
  ];
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">تعلم الإنجليزية</h1>
      <p className="muted mt-2 max-w-xl">
        مفردات وقواعد وجمل — بالتعرّض المفهوم والاستخدام الفعلي.
      </p>

      <HomeProgress
        sections={[
          { section: "terms", href: "/english/terms", title: "المفردات", total: wordTotal },
          { section: "grammar", href: "/english/grammar", title: "القواعد", total: grammarTotal },
          { section: "sentences", href: "/english/sentences", title: "الجمل", total: sentenceTotal },
        ]}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {sections.map((s, i) => (
          <Reveal key={s.href} delay={(i % 3) * 0.06}>
          <Link
            href={s.href}
            className={`card group block p-6 transition-colors duration-300 hover:opacity-80 ${s.tint}`}
            aria-label={`${s.title} — ${s.count === null ? s.countLabel : `${s.count} ${s.countLabel}`}`}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{
                  color: "var(--md-sys-color-on-primary-container)",
                }}
              >
                <s.Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <ChevronLeft
                className="mt-1 h-5 w-5 shrink-0 transition-transform duration-200 motion-safe:group-hover:-translate-x-1 motion-reduce:transform-none"
                style={{ color: "var(--muted)" }}
                aria-hidden="true"
              />
            </div>
            <h2 className="mt-3 text-xl font-semibold">{s.title}</h2>
            <p className="card-ink mt-1 text-sm">{s.description}</p>
            <p className="muted mt-3 text-sm">
              {s.count === null ? s.countLabel : `${s.count} ${s.countLabel}`}
            </p>
          </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
