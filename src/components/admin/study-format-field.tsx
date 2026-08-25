"use client";

import { FieldLabel } from "@/components/admin/admin-form-field";
import { getStudyFormatOptions } from "@/lib/format";

// 카테고리와 별개 개념(Figma node 355:999 "형태") — Online/Offline 중 1개만 선택(단일 선택).
// 고정된 2개뿐이라 카테고리 필드와 달리 직접 입력은 없다. 저장은 카테고리와 같은
// studies.tags 배열에 합쳐서 들어간다.
export function StudyFormatField({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const options = getStudyFormatOptions();

  // 같은 배열을 카테고리 필드와 공유하므로, 형태 옵션만 걷어낸 뒤 새로 고른 값을 다시 넣는다
  // — 이미 선택된 걸 다시 누르면 해제(선택 없음)된다.
  function select(option: string) {
    const isSelected = values.includes(option);
    const withoutFormatOptions = values.filter((v) => !options.includes(v));
    onChange(isSelected ? withoutFormatOptions : [...withoutFormatOptions, option]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>형태</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => select(option)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                selected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "border-[var(--color-line)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
