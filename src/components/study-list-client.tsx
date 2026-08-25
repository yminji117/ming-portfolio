"use client";

import { useRef, useState, useTransition, type RefObject } from "react";
import { loadMoreStudies } from "@/app/study/actions";
import { StudyListGrid } from "@/components/study-list-grid";
import { getStudyCategoryLabel, getStudyCategoryOptions } from "@/lib/format";
import type { Study } from "@/lib/types";

const ALL = "all";
// Figma 'Study | MINJI' 그대로 — 실제 콘텐츠에 어떤 태그가 있는지와 무관하게 항상 이 목록만 보여준다.
const FILTER_CATEGORIES = getStudyCategoryOptions();

export function StudyListClient({
  initialItems,
  total,
}: {
  initialItems: Study[];
  total: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<string>(ALL);
  const filterScrollRef = useRef<HTMLDivElement>(null);

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
        {FILTER_CATEGORIES.map((tag, i) => (
          <FilterChip
            key={tag}
            label={getStudyCategoryLabel(tag)}
            selected={active === tag}
            onClick={() => setActive(tag)}
            index={i + 1}
            scrollRef={filterScrollRef}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
          해당 카테고리의 스터디가 없어요.
        </p>
      ) : (
        <StudyListGrid studies={filtered} />
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
