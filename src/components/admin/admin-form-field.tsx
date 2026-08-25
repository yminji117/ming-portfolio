"use client";

import type { ChangeEvent, ReactNode } from "react";

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="flex items-baseline gap-1.5 text-[13px] font-medium text-[var(--color-text)]">
      {children}
      {hint && <span className="text-[12px] font-normal text-[var(--color-text-muted)]">{hint}</span>}
    </span>
  );
}

const inputClass =
  "h-10 rounded-[10px] border border-[var(--color-line)] bg-white px-3 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]";

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
        className={inputClass}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  rows = 3,
  placeholder,
  required,
  maxLength,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}) {
  const nearLimit = maxLength != null && value.length >= maxLength;

  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <FieldLabel hint={hint}>{label}</FieldLabel>
        {maxLength != null && (
          <span
            className={`text-[11px] tabular-nums ${nearLimit ? "text-red-500" : "text-[var(--color-text-muted)]"}`}
          >
            {value.length} / {maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        rows={rows}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="resize-none rounded-[10px] border border-[var(--color-line)] bg-white p-3 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
      />
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={inputClass}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// role/tools/tags/gallery_urls 같은 문자열 배열 필드 — 입력 후 Enter/쉼표로 칩 추가, ×로 제거
export function TagsField({
  label,
  hint,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  function addFromInput(raw: string) {
    const next = raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .filter((v) => !values.includes(v));
    if (next.length) onChange([...values, ...next]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex flex-wrap items-center gap-1.5 rounded-[10px] border border-[var(--color-line)] bg-white p-2">
        {values.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-accent)]"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="text-[13px] leading-none opacity-70 hover:opacity-100"
              aria-label={`${tag} 삭제`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={placeholder ?? "입력 후 Enter"}
          onKeyDown={(event) => {
            // 한글 등 IME 조합 중에 Enter를 누르면 조합 확정용 keydown이 먼저 발생하고,
            // 뒤이어 실제 Enter keydown이 한 번 더 발생한다 — 이걸 걸러내지 않으면
            // 마지막 글자가 지워진 입력값으로 addFromInput이 한 번 더 호출돼 태그가 잘못 쪼개진다.
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addFromInput(event.currentTarget.value);
              event.currentTarget.value = "";
            }
          }}
          onBlur={(event) => {
            addFromInput(event.currentTarget.value);
            event.currentTarget.value = "";
          }}
          className="min-w-[120px] flex-1 border-none bg-transparent text-[13px] text-[var(--color-text)] outline-none"
        />
      </div>
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2 text-[14px] text-[var(--color-text)] ${disabled ? "opacity-40" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--color-accent)]"
      />
      {label}
    </label>
  );
}

// 시작일/종료일을 한 항목으로 묶고, "진행중"을 체크하면 종료일 입력을 비활성화 + 비운다.
export function DateRangeField({
  label,
  startValue,
  endValue,
  ongoing,
  onStartChange,
  onEndChange,
  onOngoingChange,
  ongoingLabel = "진행중",
}: {
  label: string;
  startValue: string;
  endValue: string;
  ongoing: boolean;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onOngoingChange: (ongoing: boolean) => void;
  ongoingLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={startValue}
          onChange={(event) => onStartChange(event.target.value)}
          className={inputClass}
        />
        <span className="text-[13px] text-[var(--color-text-muted)]">~</span>
        <input
          type="date"
          value={endValue}
          disabled={ongoing}
          onChange={(event) => onEndChange(event.target.value)}
          className={`${inputClass} ${ongoing ? "opacity-40" : ""}`}
        />
        <label className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
          <input
            type="checkbox"
            checked={ongoing}
            onChange={(event) => onOngoingChange(event.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          {ongoingLabel}
        </label>
      </div>
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[var(--color-line)] bg-white p-5">
      <h2 className="text-[14px] font-bold text-[var(--color-text)]">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
