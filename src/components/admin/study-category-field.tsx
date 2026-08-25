"use client";

import { useState } from "react";
import { FieldLabel } from "@/components/admin/admin-form-field";
import { getStudyCategoryLabel, getStudyCategoryOptions, getStudyFormatOptions } from "@/lib/format";

const inputClass =
  "h-10 rounded-[10px] border border-[var(--color-line)] bg-white px-3 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]";

// Works의 IndustriesField와 동일한 방식 — Figma 시안에 정해진 카테고리 목록에서 여러 개
// 고르고, 목록에 없는 값은 직접 입력으로 추가한다. /study 필터 칩과 항상 같은 순서를 쓴다.
export function StudyCategoryField({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const options = getStudyCategoryOptions();
  const formatOptions = getStudyFormatOptions();
  // 형태(Online/Offline)는 별도 필드(StudyFormatField)가 관리하므로 여기 커스텀 값 목록엔
  // 안 뜨게 걸러낸다 — 둘 다 같은 tags 배열을 공유해서 생기는 겹침을 막는다.
  const customValues = values.filter((v) => !options.includes(v) && !formatOptions.includes(v));
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
      <FieldLabel hint="필터 칩 기준값 · 여러 개 선택 가능">카테고리</FieldLabel>
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
              {getStudyCategoryLabel(option)}
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
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
          placeholder="목록에 없는 값 직접 입력 후 Enter"
          className={inputClass}
        />
      </div>
    </div>
  );
}
