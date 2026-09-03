"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { normalizeIndustry, sortIndustries } from "@/lib/format";
import type { Project } from "@/lib/types";

const ALL = "all";

export function WorksProfessionalGrid({
  projects,
  cardMetaField = "company",
  industryOrder,
}: {
  projects: Project[];
  cardMetaField?: "company" | "period";
  industryOrder: string[];
}) {
  const industries = useMemo(() => {
    const unique = new Set<string>();
    projects.forEach((project) => {
      normalizeIndustry(project.industry).forEach((industry) => unique.add(industry));
    });
    return sortIndustries(Array.from(unique), industryOrder);
  }, [projects, industryOrder]);

  const [active, setActive] = useState<string>(ALL);
  // 모바일 가로 스크롤 필터 칩 행 — 뒤쪽 칩을 선택했을 때 해당 칩이 보이도록 스크롤한다.
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const hasFilters = industries.length > 0;
  const firstRow = projects.slice(0, 3);
  const secondRow = projects.slice(3);

  // Figma '최종' 시안: 필터 칩 컬럼 + 카드 3장이 같은 폭의 슬롯을 나눠 갖는 구조.
  // CSS 그리드 트랙(카드 1장 = 2트랙)으로 두 줄을 동일하게 맞춰야, 두 줄이 서로 다른
  // 컨테이너 폭을 기준으로 계산되는 %/calc 방식과 달리 5개 카드 크기가 항상 정확히 같아진다.
  // 필터 있음: [필터 2트랙][카드 2][카드 2][카드 2] = 8트랙, 카드 3장이 오른쪽에 꽉 채워 정렬된다.
  // 필터 없음: [카드 2][카드 2][카드 2] = 6트랙.
  // lg 미만에서는 grid-cols-1/sm:grid-cols-2로 되돌아가야 하므로, 트랙 수는 반드시
  // lg: 접두사가 붙은 Tailwind 클래스로만 지정한다 — 인라인 style은 브레이크포인트 없이
  // 항상 적용돼 모바일 레이아웃을 깨트린다.
  const rowGridClass = hasFilters ? "lg:grid-cols-8" : "lg:grid-cols-6";

  return (
    <div className="mt-8 flex flex-col gap-5 lg:mt-10">
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid lg:items-start lg:gap-5 ${rowGridClass}`}>
        {hasFilters && (
          <div
            ref={filterScrollRef}
            className="no-scrollbar flex items-start gap-1 overflow-x-auto lg:col-span-2 lg:flex-col lg:gap-3 lg:overflow-visible"
          >
            <FilterChip
              label="All"
              selected={active === ALL}
              onClick={() => setActive(ALL)}
              index={0}
              scrollRef={filterScrollRef}
            />
            {industries.map((industry, i) => (
              <FilterChip
                key={industry}
                label={industry}
                selected={active === industry}
                onClick={() => setActive(industry)}
                index={i + 1}
                scrollRef={filterScrollRef}
              />
            ))}
          </div>
        )}

        {firstRow.map((project, i) => (
          <div key={project.id} className="lg:col-span-2">
            <Reveal index={i}>
              <ProjectCard
                project={project}
                active={active !== ALL && normalizeIndustry(project.industry).includes(active)}
                metaField={cardMetaField}
                industryOrder={industryOrder}
              />
            </Reveal>
          </div>
        ))}
      </div>

      {secondRow.length > 0 && (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid lg:gap-5 ${rowGridClass}`}>
          <div aria-hidden="true" className="hidden lg:col-span-1 lg:block" />
          {secondRow.map((project, i) => (
            <div key={project.id} className="lg:col-span-2">
              <Reveal index={i + firstRow.length}>
                <ProjectCard
                  project={project}
                  active={active !== ALL && normalizeIndustry(project.industry).includes(active)}
                  metaField={cardMetaField}
                  industryOrder={industryOrder}
                />
              </Reveal>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  selected,
  onClick,
  index,
  scrollRef,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  index: number;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        onClick();
        // 2번째 칩(index 1, "All" 바로 다음)을 선택했을 때는 칩 자신의 왼쪽 끝만
        // 뷰포트 시작에 맞추면 "All"이 화면 밖으로 밀려날 수 있다. 이 경우엔
        // 행을 맨 처음(scrollLeft: 0)으로 되돌려 "All"도 함께 보이게 한다.
        if (index === 1) {
          scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          event.currentTarget.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        }
      }}
      aria-pressed={selected}
      className={`inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-5 text-left text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] ${
        selected
          ? "border-black bg-white font-bold text-black"
          : "border-white text-white hover:border-white/60"
      }`}
    >
      {label}
    </button>
  );
}
