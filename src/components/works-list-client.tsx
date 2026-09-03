"use client";

import { useMemo, useRef, useState, useTransition, type RefObject } from "react";
import { loadMoreProjects } from "@/app/works/actions";
import { WorksListGrid } from "@/components/works-list-grid";
import { getFilterableIndustries, normalizeIndustry, sortIndustries } from "@/lib/format";
import type { Project, ProjectCategory } from "@/lib/types";

const ALL = "all";

// Figma '최종' /works 리스트 — Professional/Side 두 탭 모두 같은 라이트 톤 필터 칩 + 카드 그리드를 쓴다.
// (Main 페이지의 어두운 배경용 필터 칩(works-professional-grid.tsx)과는 별도 스타일)
export function WorksListClient({
  category,
  initialItems,
  total,
  industryOrder,
}: {
  category: ProjectCategory;
  initialItems: Project[];
  total: number;
  industryOrder: string[];
}) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<string>(ALL);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const industries = useMemo(() => {
    const unique = new Set<string>();
    items.forEach((project) => {
      normalizeIndustry(project.industry).forEach((industry) => unique.add(industry));
    });
    return getFilterableIndustries(sortIndustries(Array.from(unique), industryOrder), category);
  }, [items, category, industryOrder]);

  if (items.length === 0) {
    return (
      <p className="py-20 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
        아직 등록된 프로젝트가 없어요.
      </p>
    );
  }

  const filtered =
    active === ALL ? items : items.filter((p) => normalizeIndustry(p.industry).includes(active));
  const hasMore = items.length < total;

  function handleLoadMore() {
    startTransition(async () => {
      const next = await loadMoreProjects(category, items.length);
      setItems((prev) => [...prev, ...next.items]);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {industries.length > 0 && (
        <div
          ref={filterScrollRef}
          className="no-scrollbar flex items-center gap-1 overflow-x-auto"
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

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
          해당 카테고리의 프로젝트가 없어요.
        </p>
      ) : (
        <WorksListGrid projects={filtered} industryOrder={industryOrder} />
      )}

      {hasMore && (
        <div className="flex justify-center pt-5">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-line)] px-8 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
          >
            {isPending ? "불러오는 중..." : "Load more"}
          </button>
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
        // "All" 바로 다음 칩을 고르면 행 맨 앞으로 되돌려 "All"도 함께 보이게 한다.
        if (index === 1) {
          scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          event.currentTarget.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        }
      }}
      aria-pressed={selected}
      className={`inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-5 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] ${
        selected
          ? "border-[var(--color-ink)] bg-[var(--color-ink)] font-bold text-white"
          : "border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:border-[var(--color-ink)]"
      }`}
    >
      {label}
    </button>
  );
}
