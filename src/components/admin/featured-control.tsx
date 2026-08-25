"use client";

import { CheckboxField } from "@/components/admin/admin-form-field";

// Works/Study 등록·수정 폼에 끼워 넣는 "메인 노출 + 몇 번째" 컨트롤 — 실제 저장은
// 콘텐츠 저장과 별도로 setFeaturedPosition/unfeatureItem 서버 액션이 처리한다
// (정원 초과·draft 노출은 DB의 enforce_featured_cap 트리거가 최종 방어선).
export function FeaturedControl({
  disabledReason,
  cap,
  otherCount,
  featured,
  position,
  onFeaturedChange,
  onPositionChange,
}: {
  disabledReason?: string;
  cap: number;
  otherCount: number;
  featured: boolean;
  position: number;
  onFeaturedChange: (featured: boolean) => void;
  onPositionChange: (position: number) => void;
}) {
  const maxPosition = Math.min(cap, otherCount + 1);
  const clamped = Math.min(Math.max(position, 1), maxPosition);
  const showPosition = featured && !disabledReason;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <CheckboxField
          label="메인에 노출"
          checked={featured && !disabledReason}
          disabled={Boolean(disabledReason)}
          onChange={onFeaturedChange}
        />
        {showPosition && (
          <label className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
            노출 순서
            <select
              value={clamped}
              onChange={(event) => onPositionChange(Number(event.target.value))}
              className="h-9 rounded-[8px] border border-[var(--color-line)] bg-white px-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            >
              {Array.from({ length: maxPosition }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}번째
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {disabledReason && <p className="text-[12px] text-[#a8660f]">{disabledReason}</p>}
      {showPosition && (
        <p className="text-[12px] text-[var(--color-text-muted)]">
          현재 {otherCount}건 노출 중 (최대 {cap})
        </p>
      )}
    </div>
  );
}
