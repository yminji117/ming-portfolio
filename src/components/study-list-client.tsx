"use client";

import { useMemo, useRef, useState, useTransition, type RefObject } from "react";
import { loadMoreStudies } from "@/app/study/actions";
import { StudyListGrid } from "@/components/study-list-grid";
import { getStudyFormatOptions, sortStudyCategories } from "@/lib/format";
import type { Study } from "@/lib/types";

const ALL = "all";

export function StudyListClient({
  initialItems,
  total,
  categoryOrder,
}: {
  initialItems: Study[];
  total: number;
  categoryOrder: string[];
}) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<string>(ALL);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  // Works의 industries와 동일한 방식 — 고정 목록이 아니라 실제 로드된 스터디의 tags에서
  // 뽑는다. 어드민에서 새 카테고리를 추가하면 이 필터에도 자동으로 반영된다.
  // 형태(Online/Offline)는 별개 개념이라 필터 칩에서는 제외한다.
  const formatOptions = getStudyFormatOptions();
  const categories = useMemo(() => {
    const unique = new Set<string>();
    items.forEach((study) => {
      study.tags.forEach((tag) => {
        if (!formatOptions.includes(tag)) unique.add(tag);
      });
    });
    return sortStudyCategories(Array.from(unique), categoryOrder);
  }, [items, formatOptions, categoryOrder]);

  if (items.length === 0) {
    return (
      <p className="py-20 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
        아직 등록된 스터디가 없어요.
      </p>
    );
  }

  const filtered = active === ALL ? items : items.filter((s) => s.tags.includes(active));
  const hasMore = items.length < total;

  function handleLoadMore() {
    startTransition(async () => {
      const next = await loadMoreStudies(items.length);
      setItems((prev) => [...prev, ...next.items]);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {categories.length > 0 && (
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
          {categories.map((tag, i) => (
            <FilterChip
              key={tag}
              label={tag}
              selected={active === tag}
              onClick={() => setActive(tag)}
              index={i + 1}
              scrollRef={filterScrollRef}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
          해당 카테고리의 스터디가 없어요.
        </p>
      ) : (
        <StudyListGrid studies={filtered} categoryOrder={categoryOrder} />
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
