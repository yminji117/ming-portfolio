import { Reveal } from "@/components/reveal";
import { StudyListCard } from "@/components/study-list-card";
import type { Study } from "@/lib/types";

// PRD 6.3 — Works와 동일한 그리드 규칙(Desktop 5열 / Laptop 4열 / Tablet 3열 / Mobile 2열)
export function StudyListGrid({ studies }: { studies: Study[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
      {studies.map((study, i) => (
        <Reveal key={study.id} index={i % 10}>
          <StudyListCard study={study} />
        </Reveal>
      ))}
    </div>
  );
}
