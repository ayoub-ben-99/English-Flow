import { Reveal } from "@/components/english/Reveal";
import { ResourceCard } from "@/components/english/ResourceCard";
import resources from "@/data/english/resources.json";
import type { LearningResource } from "@/types/english";

const all = resources as LearningResource[];

const groups: { id: string; title: string; hint: string; items: LearningResource[] }[] = [
  {
    id: "ar-channels",
    title: "قنوات عربية",
    hint: "شرح بالعربية للمبتدئين والمتوسطين.",
    items: all.filter((r) => r.type === "youtube_channel" && r.language === "ar"),
  },
  {
    id: "en-channels",
    title: "قنوات أجنبية",
    hint: "انغماس مباشر بالإنجليزية من أهلها.",
    items: all.filter((r) => r.type === "youtube_channel" && r.language === "en"),
  },
  {
    id: "books",
    title: "كتب موصى بها",
    hint: "مراجع ورقية للدراسة الذاتية العميقة.",
    items: all.filter((r) => r.type === "book"),
  },
];

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">مصادر التعلم</h1>
      <p className="muted mt-2 max-w-xl">
        قنوات وكتب مختارة بعناية حسب المستوى والمهارة — عربية للبداية وأجنبية للانغماس.
      </p>

      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`${g.id}-title`} className="mt-10">
          <h2 id={`${g.id}-title`} className="text-xl font-semibold">
            {g.title}
          </h2>
          <p className="muted mt-1 text-sm">{g.hint}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {g.items.map((r, i) => (
              <Reveal key={r.id} delay={(i % 2) * 0.06}>
                <ResourceCard resource={r} />
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
