"use client";

import type { StudyRoadmapStep } from "@/lib/types";

// Study 상세 로드맵 카드(PRD 5.4) — 있으면 로드맵 카드로, 없으면 플랫 행으로 렌더링된다.
export function StudyStepsEditor({
  steps,
  onChange,
}: {
  steps: StudyRoadmapStep[];
  onChange: (steps: StudyRoadmapStep[]) => void;
}) {
  function update(index: number, step: StudyRoadmapStep) {
    onChange(steps.map((s, i) => (i === index ? step : s)));
  }
  function remove(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }
  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  const inputClass =
    "h-9 rounded-[8px] border border-[var(--color-line)] bg-white px-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-[12px] border border-[var(--color-line)] bg-[#fafbfd] p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[var(--color-text-muted)]">{index + 1}단계</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#eceef3] disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === steps.length - 1}
                className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#eceef3] disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="h-7 rounded-full px-2 text-[12px] text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          </div>
          <input
            value={step.label}
            onChange={(event) => update(index, { ...step, label: event.target.value })}
            placeholder="라벨 (예: 1단계)"
            className={inputClass}
          />
          <textarea
            value={step.text}
            onChange={(event) => update(index, { ...step, text: event.target.value })}
            placeholder="내용"
            rows={2}
            className="resize-none rounded-[8px] border border-[var(--color-line)] bg-white p-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...steps, { label: `${steps.length + 1}단계`, text: "" }])}
        className="self-start rounded-full border border-dashed border-[var(--color-line)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        + 단계 추가
      </button>
    </div>
  );
}
