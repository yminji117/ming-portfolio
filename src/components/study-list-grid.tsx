import { Reveal } from "@/components/reveal";
import { StudyListCard } from "@/components/study-list-card";
import type { Study } from "@/lib/types";

// 가로형 카드 리스트 그리드 — Mobile 1열 / Tablet 이상 2열(요청에 따라 Desktop도 3열 대신 2열 유지)
export function StudyListGrid({
  studies,
  categoryOrder,
}: {
  studies: Study[];
  categoryOrder: string[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {studies.map((study, i) => (
        <Reveal key={study.id} index={i % 8}>
          <StudyListCard study={study} categoryOrder={categoryOrder} />
        </Reveal>
      ))}
    </div>
  );
}
