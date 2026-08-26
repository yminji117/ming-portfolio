"use client";

import { useState } from "react";
import { FieldLabel } from "@/components/admin/admin-form-field";
import { getIndustryLabel, getIndustryOptions } from "@/lib/format";
import type { ProjectCategory } from "@/lib/types";

// 분류(category)별로 Figma 시안에 정해진 업종 목록(getIndustryOptions)에서 여러 개 고르고,
// 목록에 없는 값이 필요하면 직접 입력으로 추가한다 — /works 필터 칩·카드 라벨 기준값이라
// 오타로 칩이 어지러워지지 않도록 자유 텍스트 대신 선택식을 기본으로 한다.
// extraOptions: 이 분류의 다른 프로젝트에서 이미 "+ 직접 입력"으로 한 번 쓰인 값들 —
// Figma 고정 목록에는 없지만 재사용 가능하도록 선택지에 함께 노출한다.
export function IndustriesField({
  category,
  values,
  extraOptions = [],
  onChange,
}: {
  category: ProjectCategory;
  values: string[];
  extraOptions?: string[];
  onChange: (values: string[]) => void;
}) {
  const fixedOptions = getIndustryOptions(category);
  const reusableOptions = extraOptions.filter((v) => !fixedOptions.includes(v)).sort();
  const options = [...fixedOptions, ...reusableOptions];
  const customValues = values.filter((v) => !options.includes(v));
  const [customInput, setCustomInput] = useState("");

  function toggle(option: string) {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  }

  function addCustom() {
    const next = customInput.trim();
    if (next && !values.includes(next)) onChange([...values, next]);
    setCustomInput("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel hint="필터 칩·카드 라벨 기준값 · 여러 개 선택 가능">업종(industry)</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
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
              {getIndustryLabel(option)}
            </button>
          );
        })}
      </div>

      {customValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-full bg-[#eceef3] px-2.5 py-1 text-[12px] font-medium text-[var(--color-text)]"
            >
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== value))}
                className="text-[13px] leading-none opacity-70 hover:opacity-100"
                aria-label={`${value} 삭제`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={customInput}
          onChange={(event) => setCustomInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
          placeholder="목록에 없는 값 직접 입력 후 Enter"
          className="h-8 flex-1 rounded-[8px] border border-[var(--color-line)] bg-white px-2.5 text-[12px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>
    </div>
  );
}
