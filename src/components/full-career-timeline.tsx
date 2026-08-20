"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { Tag } from "@/components/tag";
import { formatCareerRange } from "@/lib/format";
import type { Career, CareerType } from "@/lib/types";

const TYPE_LABEL: Record<CareerType, string> = {
  school: "학교",
  language: "어학연수",
  company: "회사",
};

const FILTERS: { key: "all" | CareerType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "school", label: TYPE_LABEL.school },
  { key: "language", label: TYPE_LABEL.language },
  { key: "company", label: TYPE_LABEL.company },
];

// PRD 6.4 — 연혁 타임라인: 좌측 라벨 배지(학교/어학연수/회사) + 기간 + 기관명 + 설명, 라벨별 필터[선택]
export function FullCareerTimeline({ careers }: { careers: Career[] }) {
  const [active, setActive] = useState<"all" | CareerType>("all");
  if (careers.length === 0) return null;

  const filtered = active === "all" ? careers : careers.filter((c) => c.type === active);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="연혁 필터">
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
          해당 구분의 항목이 없어요.
        </p>
      ) : (
        <ol className="flex flex-col gap-8 border-l border-[var(--color-line)] pl-6">
          {filtered.map((career, i) => (
            <Reveal key={career.id} index={i}>
              <li className="relative">
                <span className="absolute -left-[27px] top-1.5 size-2 rounded-full bg-[var(--color-accent)]" />
                <div className="flex flex-wrap items-center gap-2">
                  <Tag>{TYPE_LABEL[career.type]}</Tag>
                  <span className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                    {formatCareerRange(career.start_date, career.end_date)}
                  </span>
                </div>
                <p className="mt-2 text-[length:var(--fs-body)] font-medium">{career.org_name}</p>
                {(career.title || career.description) && (
                  <p className="mt-0.5 text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                    {[career.title, career.description].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      )}
    </div>
  );
}
