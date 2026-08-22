"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { CurrentlyRow, LABEL_TEXT } from "@/components/currently-row";
import { ArrowRightIcon, ChevronRightIcon } from "@/components/icons";
import type { CurrentlyCategory, CurrentlyDoing, CurrentlyLabel } from "@/lib/types";

type FilterOption<T extends string> = { value: T; label: string };

// Figma '최종' node 229:741 — 닫힌 트리거/기본 옵션 라벨은 "카테고리 All" / "상태 All"로 표시되고,
// 나머지 옵션은 값 이름만 표시된다(Woke/Study/Side, 진행중/대기/완료).
const CATEGORY_OPTIONS: FilterOption<"all" | CurrentlyCategory>[] = [
  { value: "all", label: "카테고리 All" },
  { value: "works", label: "Woke" },
  { value: "study", label: "Study" },
  { value: "side", label: "Side" },
];

const STATUS_OPTIONS: FilterOption<"all" | CurrentlyLabel>[] = [
  { value: "all", label: "상태 All" },
  { value: "doing", label: LABEL_TEXT.doing },
  { value: "want", label: LABEL_TEXT.want },
  { value: "done", label: LABEL_TEXT.done },
];

// 옵션마다 텍스트 길이가 달라도 박스 안 요소가 움직이지 않도록 텍스트는 왼쪽,
// 화살표는 오른쪽에 고정한다(폭은 FilterDropdown의 widthClass로 고정).
const triggerClass =
  "inline-flex h-9 items-center justify-between gap-3 rounded-[4px] border border-[var(--color-line)] bg-white px-3 text-[length:var(--fs-body)] text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] hover:border-black focus:border-black focus:outline-none";

// Figma node 271:1115/271:1130 — 드랍다운 패널: 흰 배경 + 라인 보더, 선택된 옵션만
// rgba(210,213,219,.3) 배경 + SemiBold로 강조.
function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  widthClass,
}: {
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  widthClass: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${widthClass}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={`${triggerClass} w-full`}
      >
        <span>{selected.label}</span>
        <ChevronRightIcon className="size-6 shrink-0 rotate-90" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-10 w-full rounded-[4px] border border-[var(--color-line)] bg-white py-2"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full px-2 py-1.5 text-center text-[length:var(--fs-body)] text-[var(--color-text)] ${
                    isSelected ? "bg-[rgba(210,213,219,0.3)] font-semibold" : "font-normal hover:bg-black/5"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Figma '최종' node 256:5752 — Button - 다음 이미지(글라스: bg-white/10 + border rgba(210,213,219,.3) + backdrop blur),
// project-gallery.tsx의 arrowButtonClass와 동일한 글라스 버튼 스타일을 재사용한다.
const moreButtonClass =
  "flex size-10 items-center justify-center rounded-full border border-[rgba(210,213,219,0.3)] bg-white/10 text-[var(--color-text)] shadow-[0_8px_24px_rgba(19,20,23,0.08)] backdrop-blur-xl backdrop-saturate-150 transition-[opacity,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-white/20";

const PAGE_SIZE = 10;

// PRD 6.4 — /about은 Main의 Currently Doing 컴포넌트를 전체 노출 + 카테고리/상태 필터로 재사용한다.
export function CurrentlyDoingFilterableList({ items }: { items: CurrentlyDoing[] }) {
  const [categoryFilter, setCategoryFilter] = useState<"all" | CurrentlyCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CurrentlyLabel>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = items.filter(
    (item) =>
      (categoryFilter === "all" || item.category === categoryFilter) &&
      (statusFilter === "all" || item.label === statusFilter)
  );

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const isExpandable = filtered.length > PAGE_SIZE;

  return (
    <div className="mt-8 flex flex-col gap-6 lg:mt-12">
      <div className="flex flex-wrap gap-3">
        <FilterDropdown
          label="카테고리 필터"
          options={CATEGORY_OPTIONS}
          value={categoryFilter}
          widthClass="min-w-[146px]"
          onChange={(next) => {
            setCategoryFilter(next);
            setVisibleCount(PAGE_SIZE);
          }}
        />
        <FilterDropdown
          label="상태 필터"
          options={STATUS_OPTIONS}
          value={statusFilter}
          widthClass="min-w-[118px]"
          onChange={(next) => {
            setStatusFilter(next);
            setVisibleCount(PAGE_SIZE);
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
          해당 조건의 항목이 없어요.
        </p>
      ) : (
        <div className={`relative ${isExpandable ? "pb-8" : ""}`}>
          <div className="divide-y divide-[#e5e5e0] border-t border-black border-b border-b-[#e5e5e0]">
            {visibleItems.map((item, i) => (
              <Reveal key={item.id} index={i}>
                <CurrentlyRow item={item} />
              </Reveal>
            ))}
          </div>

          {isExpandable && (
            <button
              type="button"
              onClick={() =>
                setVisibleCount((v) => (hasMore ? Math.min(v + PAGE_SIZE, filtered.length) : PAGE_SIZE))
              }
              aria-label={hasMore ? "더보기" : "접기"}
              aria-expanded={!hasMore}
              className={`${moreButtonClass} absolute bottom-0 left-1/2 -translate-x-1/2 lg:left-[calc(50%+40px)]`}
            >
              <ArrowRightIcon
                className={`size-6 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] ${
                  hasMore ? "rotate-90" : "-rotate-90"
                }`}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
