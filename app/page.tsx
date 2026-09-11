import { ArrowDown, BookOpen, Headphones, Mic, PenLine, Users, Wrench } from "lucide-react";
import Link from "next/link";
import { HeroIntro } from "@/components/english/HeroIntro";
import { OwlHero } from "@/components/english/OwlHero";
import { Reveal } from "@/components/english/Reveal";
import { ScrollProgress } from "@/components/english/ScrollProgress";
import { SectionHead } from "@/components/english/SectionHead";
import { SiteLogo } from "@/components/english/SiteLogo";
import { StatsStrip } from "@/components/english/StatsStrip";
import { ThemeToggle } from "@/components/english/ThemeToggle";

const phases = [
  {
    tint: "tint-mint",
    tag: "tag-green",
    time: "الأسابيع 1 – 3",
    title: "الأساس",
    description: "بناء بنك سمعي ومفردات عالية التكرار، قبل أي محاولة إنتاج.",
    points: "300–500 كلمة (Oxford 3000) عبر Anki · استماع مبسط يومي · جمل كاملة لا كلمات معزولة",
  },
  {
    tint: "tint-sky",
    tag: "tag-purple",
    time: "الأسابيع 4 – 8",
    title: "الانغماس الموجّه",
    description: "محتوى أعلى من مستواك بقليل، بلا ترجمة ذهنية.",
    points: "React docs بالإنجليزية · فيديوهات مبسطة · الفهم المباشر لا كلمة بكلمة",
  },
  {
    tint: "tint-yellow-bold",
    tag: "tag-orange",
    time: "من الأسبوع 6 وما بعده",
    title: "الإنتاج",
    description: "الكلام والكتابة يبدآن مبكراً، حتى بمستوى ضعيف.",
    points: "Shadowing عشر دقائق يومياً · محادثة italki أسبوعية · تصحيح Grammarly",
  },
  {
    tint: "tint-lavender",
    tag: "tag-purple",
    time: "بعد شهرين تقريباً",
    title: "الصقل",
    description: "القواعد لتفسير أخطاء لاحظتها فعلاً في كلامك.",
    points: "English Grammar in Use · أخطاؤك المتكررة فقط · مراجعة دورية",
  },
];

const tips = [
  {
    Icon: Headphones,
    tint: "tint-mint",
    title: "استمع يومياً",
    text: "20–30 دقيقة من محتوى مبسط قريب من مستواك — الأذن تتعلم قبل اللسان.",
  },
  {
    Icon: BookOpen,
    tint: "tint-sky",
    title: "احفظ جملاً لا كلمات",
    text: "استخدم التكرار المتباعد (Anki) بجمل كاملة، فالكلمة وحدها سريعة النسيان.",
  },
  {
    Icon: Mic,
    tint: "tint-yellow-bold",
    title: "قلّد بصوت عالٍ",
    text: "تقنية Shadowing: كرر ما تسمعه بنفس النبرة 10 دقائق يومياً لتحسين النطق.",
  },
  {
    Icon: PenLine,
    tint: "tint-lavender",
    title: "اكتب كل يوم",
    text: "بضع جمل بسيطة يومياً تثبّت المفردات والقواعد أكثر من القراءة وحدها.",
  },
  {
    Icon: Users,
    tint: "tint-rose",
    title: "تحدث أسبوعياً",
    text: "محادثة حقيقية واحدة أسبوعياً — ابدأ بمستواك الحالي ولا تنتظر الكمال.",
  },
  {
    Icon: Wrench,
    tint: "tint-cream",
    title: "صحح من أخطائك",
    text: "ادرس القاعدة فقط عندما تفسر خطأ ارتكبته فعلاً — هكذا تلتصق بذهنك.",
  },
];

const startSteps = [
  { when: "اليوم", what: "نزّل Anki + مجموعة Oxford 3000" },
  { when: "هذا الأسبوع", what: "20–30 دقيقة يومياً استماع لمحتوى مبسط" },
  { when: "عادة يومية", what: "Shadowing عشر دقائق من فيديو قصير" },
  { when: "بعد 4–6 أسابيع", what: "أول محادثة على italki" },
];

export default function HomePage() {
  return (
    <div>
      <ScrollProgress />
      <header
        className="sticky top-0 z-40"
        style={{
          background: "var(--md-sys-color-surface)",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        <div
          className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6"
          style={{ maxWidth: 880 }}
        >
          <span className="flex min-w-0 items-center gap-2 text-lg font-semibold">
            <span className="shrink-0" style={{ color: "var(--md-sys-color-primary)" }}>
              <SiteLogo className="h-8 w-8" />
            </span>
            <span className="truncate">تعلم الإنجليزية</span>
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/english"
              className="inline-flex min-h-11 items-center rounded-lg px-5 text-sm font-medium"
              style={{
                background: "var(--md-sys-color-primary)",
                color: "var(--md-sys-color-on-primary)",
              }}
            >
              ابدأ التعلم
            </Link>
          </div>
        </div>
      </header>

      <HeroIntro>
        <div
          className="mx-auto grid items-center gap-10 px-4 sm:px-6 md:grid-cols-[1fr_auto]"
          style={{ maxWidth: 880, paddingTop: 64, paddingBottom: 48 }}
        >
          <div className="min-w-0">
            <p data-hero className="muted text-sm font-medium">
              مسار شخصي، لا منهج عام
            </p>
            <h1
              data-hero
              className="mt-3 font-semibold tracking-tight"
              style={{ fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 1.1 }}
            >
              تعلّم الإنجليزية بنفسك
            </h1>
            <p data-hero className="muted mt-4" style={{ maxWidth: 640 }}>
              اللغة تُكتسب بالتعرّض المفهوم والاستخدام الفعلي، لا بحفظ القواعد
              نظرياً.
            </p>
            <div data-hero>
              <Link
                href="/english"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-lg px-7 text-base font-semibold"
                style={{
                  background: "var(--md-sys-color-primary)",
                  color: "var(--md-sys-color-on-primary)",
                }}
              >
                ابدأ الآن
                <ArrowDown className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div data-hero className="w-full">
          </div>
        </div>
      </HeroIntro>
      <StatsStrip />

      <main>
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 880 }}>
          <section id="diagnosis" className="py-16" aria-labelledby="diagnosis-title">
            <SectionHead id="diagnosis-title">
              لماذا فشلت الطريقة التقليدية
            </SectionHead>
            <div className="grid gap-4 md:grid-cols-2">
              <Reveal>
                <div className="card p-8 tint-rose">
                  <h3 className="mb-3 text-xl font-semibold">الطريقة التي فشلت</h3>
                  <ul className="card-ink space-y-3">
                    <li>· قواعد مجردة قبل أي تعرض فعلي للغة</li>
                    <li>· حفظ كلمات معزولة بلا سياق أو جملة</li>
                    <li>· الأولوية للصحة النحوية قبل الفهم</li>
                    <li>· لا استخدام فعلي، فتبقى معرفة خاملة</li>
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <div className="card p-8 tint-mint">
                  <h3 className="mb-3 text-xl font-semibold">الطريقة التي تعمل</h3>
                  <ul className="card-ink space-y-3">
                    <li>· تعرّض مفهوم أولاً: سمع وقراءة قريبة من مستواك</li>
                    <li>· مفردات ضمن جمل كاملة، بتكرار متباعد</li>
                    <li>· إنتاج مبكر للكلام، حتى بمستوى ضعيف</li>
                    <li>· القواعد تفسّر أخطاء حقيقية، لا نقطة بداية</li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </section>

        </div>

        <section id="path" className="pb-16" aria-labelledby="path-title">
          <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 880 }}>
            <SectionHead id="path-title">
              المسار: أربع مراحل
            </SectionHead>
            <div className="grid gap-4 md:grid-cols-2">
              {phases.map((p, i) => (
                <Reveal key={p.title} delay={(i % 2) * 0.06}>
                  <article className={`card h-full p-8 ${p.tint}`}>
                    <span className={`tag ${p.tag}`}>{p.time}</span>
                    <h3 className="mb-2 mt-3 text-xl font-semibold">{p.title}</h3>
                    <p className="card-ink mb-3">{p.description}</p>
                    <p className="card-ink text-sm">{p.points}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 880 }}>
          <section className="pb-16" aria-labelledby="qa-title">
            <SectionHead id="qa-title">
              قواعد أم مفردات؟ حفظ أم لا؟
            </SectionHead>
            <div className="grid gap-4 md:grid-cols-2">
              <Reveal>
                <div className="card tint-cream p-8" style={{ borderColor: "transparent" }}>
                  <h3 className="mb-2 text-xl font-semibold">المفردات أولاً</h3>
                  <p className="card-ink text-sm">
                    بدون كلمات لا معنى للقواعد. التكرار المتباعد ضمن جملة كاملة
                    — الفرق عن تجربة الفرنسية.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <div className="card p-8">
                  <h3 className="mb-2 text-xl font-semibold">القواعد لاحقاً، وظيفياً</h3>
                  <p className="card-ink text-sm">
                    تُدرَس عند الحاجة لتفسير خطأ ارتكبته، لا كمنهج مستقل من اليوم
                    الأول.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          <section className="pb-16" aria-labelledby="tips-title">
            <SectionHead id="tips-title">
              نصائح وتقنيات للتعلم الذاتي
            </SectionHead>
            <div className="grid gap-4 sm:grid-cols-2">
              {tips.map((t, i) => (
                <Reveal key={t.title} delay={(i % 2) * 0.06}>
                  <article className={`card h-full p-6 ${t.tint}`}>
                    <t.Icon
                      className="h-6 w-6"
                      style={{ color: "var(--md-sys-color-primary)" }}
                      aria-hidden="true"
                    />
                    <h3 className="mb-1 mt-3 text-lg font-semibold">{t.title}</h3>
                    <p className="card-ink text-sm">{t.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
