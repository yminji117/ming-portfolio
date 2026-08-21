"use client";

import { useMemo, useRef, useState, useTransition, type RefObject } from "react";
import { loadMoreStudies } from "@/app/study/actions";
import { StudyListGrid } from "@/components/study-list-grid";
import type { Study } from "@/lib/types";

const ALL = "all";
// Figma '최종' 시안 필터 칩 노출 순서 — 목록에 없는 태그는 뒤에 그대로 이어 붙인다.
const STUDY_TAG_ORDER = ["AI", "Data", "Online", "Offline"];

function sortStudyTags(tags: string[]): string[] {
  return [...tags].sort((a, b) => {
    const ai = STUDY_TAG_ORDER.indexOf(a);
    const bi = STUDY_TAG_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

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

  // Study는 태그를 배열로 여러 개 가질 수 있어 Works의 단일 industry 필터와 달리
  // "선택한 태그를 포함하는가"로 판정한다.
  const tags = useMemo(() => {
    const unique = new Set<string>();
    items.forEach((study) => study.tags.forEach((tag) => unique.add(tag)));
    return sortStudyTags(Array.from(unique));
  }, [items]);

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
      {tags.length > 0 && (
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
          {tags.map((tag, i) => (
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
          해당 태그의 스터디가 없어요.
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
