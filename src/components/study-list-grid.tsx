import { Reveal } from "@/components/reveal";
import { StudyListCard } from "@/components/study-list-card";
import type { Study } from "@/lib/types";

// Figma '최종' Study 리스트 그리드 — 가로형 카드라 Works와 달리 1열/2열까지만 (Mobile 1 / Tablet+ 2)
export function StudyListGrid({ studies }: { studies: Study[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {studies.map((study, i) => (
        <Reveal key={study.id} index={i % 8}>
          <StudyListCard study={study} />
        </Reveal>
      ))}
    </div>
  );
}
