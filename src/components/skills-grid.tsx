import Image from "next/image";
import type { Skill } from "@/lib/types";

// PRD 6.4 — 숙련도 게이지 없이 "주 사용 / 사용 가능" 2단계 그룹으로만 구분
export function SkillsGrid({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return null;

  const main = skills.filter((skill) => skill.group === "main");
  const sub = skills.filter((skill) => skill.group === "sub");

  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-[length:var(--fs-eyebrow)] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        Skills
      </h2>
      {main.length > 0 && <SkillGroupRow title="주 사용" items={main} />}
      {sub.length > 0 && <SkillGroupRow title="사용 가능" items={sub} />}
    </section>
  );
}

function SkillGroupRow({ title, items }: { title: string; items: Skill[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[length:var(--fs-body)] font-medium">{title}</p>
      <div className="flex flex-wrap gap-3">
        {items.map((skill) => (
          <div
            key={skill.id}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-[length:var(--fs-body)]"
          >
            {skill.icon_url && (
              <Image src={skill.icon_url} alt="" width={18} height={18} className="size-[18px]" />
            )}
            <span>{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
