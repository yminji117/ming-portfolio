"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { formatCareerRange } from "@/lib/format";
import type { Career, CareerType } from "@/lib/types";

const TYPE_LABEL: Record<CareerType, string> = {
  company: "회사",
  academy: "학원",
  language: "어학연수",
  school: "학교",
};

// Figma '최종' 시안 필터 순서 — 전체/회사/학원/어학연수/학교
const FILTERS: { key: "all" | CareerType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "company", label: TYPE_LABEL.company },
  { key: "academy", label: TYPE_LABEL.academy },
  { key: "language", label: TYPE_LABEL.language },
  { key: "school", label: TYPE_LABEL.school },
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
        <ol className="relative flex flex-col gap-8 pl-6">
          {/* 점(size-2, -left-[25px])의 정중앙에 오도록 별도 라인으로 위치를 맞춘다 —
              ol의 border-l은 점 중심이 아니라 점의 왼쪽 끝에 걸려서 어긋나 보였다.
              top은 첫 점의 세로 중심(top-1.5 + size-2 절반 = 10px)에서 시작해 위로 안 삐져나오게 한다. */}
          <span className="absolute bottom-0 left-[3px] top-[10px] w-px bg-[var(--color-line)]" aria-hidden="true" />
          {filtered.map((career, i) => (
            <Reveal key={career.id} index={i}>
              <li className="relative">
                <span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-[var(--color-accent)]" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-[23px] items-center justify-center rounded-full border border-[#131417] px-[13px] text-[12px] text-[#131417]">
                    {TYPE_LABEL[career.type]}
                  </span>
                  <span className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                    {formatCareerRange(career.start_date, career.end_date)}
                  </span>
                </div>
                <p className="mt-2 text-[length:var(--fs-body)] font-medium">{career.org_name}</p>
                {career.type === "academy" ? (
                  <div className="mt-0.5 flex flex-col gap-3">
                    {career.title && (
                      <p className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                        {career.title}
                      </p>
                    )}
                    {career.description && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-[4px] border border-current px-[5px] py-[2.5px] text-[12px]">
                          자격증
                        </span>
                        <span className="text-[length:var(--fs-body)]">{career.description}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  (career.title || career.description) && (
                    <p className="mt-0.5 text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                      {[career.title, career.description].filter(Boolean).join(" · ")}
                    </p>
                  )
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      )}
    </div>
  );
}
