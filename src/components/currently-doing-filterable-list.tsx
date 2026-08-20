"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { CurrentlyRow, LABEL_TEXT } from "@/components/currently-row";
import type { CurrentlyDoing } from "@/lib/types";

const FILTERS: { key: "all" | CurrentlyDoing["label"]; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "doing", label: LABEL_TEXT.doing },
  { key: "want", label: LABEL_TEXT.want },
  { key: "done", label: LABEL_TEXT.done },
];

// PRD 6.4 — /about은 Main의 Currently Doing 컴포넌트를 전체 노출 + 라벨 필터로 재사용한다.
export function CurrentlyDoingFilterableList({ items }: { items: CurrentlyDoing[] }) {
  const [active, setActive] = useState<"all" | CurrentlyDoing["label"]>("all");
  const filtered = active === "all" ? items : items.filter((item) => item.label === active);

  return (
    <div className="mt-8 flex flex-col gap-6 lg:mt-12">
      <div className="flex flex-wrap gap-2" role="group" aria-label="상태 필터">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            aria-pressed={active === filter.key}
            onClick={() => setActive(filter.key)}
            className={`inline-flex h-9 items-center justify-center rounded-full border px-4 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] ${
              active === filter.key
                ? "border-black bg-black text-white"
                : "border-[var(--color-line)] text-[var(--color-text-muted)] hover:border-black hover:text-[var(--color-text)]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
          해당 상태의 항목이 없어요.
        </p>
      ) : (
        <div className="divide-y divide-[#e5e5e0] border-t border-black border-b border-b-[#e5e5e0]">
          {filtered.map((item, i) => (
            <Reveal key={item.id} index={i}>
              <CurrentlyRow item={item} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
