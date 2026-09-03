"use client";

import { FieldLabel } from "@/components/admin/admin-form-field";

// Works의 업종, Study의 카테고리 등 "고정 목록에서 여러 개 선택" 패턴을 공유하는 필드들의
// 공용 구현. 새 값은 "카테고리 관리"에서만 추가하므로 여기서는 직접 입력을 받지 않는다.
// excludeOptions는 다른 필드(예: Study의 형태/Online-Offline)가 같은 배열을 나눠 쓸 때
// 그 값들을 선택지에서 걸러내기 위한 것이다.
export function ChipsMultiSelectField({
  label,
  hint,
  values,
  options,
  excludeOptions = [],
  onChange,
}: {
  label: string;
  hint: string;
  values: string[];
  options: string[];
  excludeOptions?: string[];
  onChange: (values: string[]) => void;
}) {
  const visibleOptions = options.filter((v) => !excludeOptions.includes(v));

  function toggle(option: string) {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {visibleOptions.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option)}
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
