"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createCareer,
  deleteCareer,
  updateCareer,
  type CareerInput,
} from "@/app/admin/(protected)/about/actions";
import { DateRangeField, FieldLabel, SelectField, TextField } from "@/components/admin/admin-form-field";
import type { Career, CareerType } from "@/lib/types";

const TYPE_OPTIONS: { value: CareerType; label: string }[] = [
  { value: "company", label: "회사" },
  { value: "academy", label: "학원" },
  { value: "language", label: "어학연수" },
  { value: "school", label: "학교" },
];

type Row = { id: string; isNew: boolean; input: CareerInput };

function toInput(career?: Career): CareerInput {
  return {
    type: career?.type ?? "company",
    org_name: career?.org_name ?? "",
    title: career?.title ?? null,
    start_date: career?.start_date ?? null,
    end_date: career?.end_date ?? null,
    description: career?.description ?? null,
    industry: career?.industry ?? null,
  };
}

// Front(FullCareerTimeline/CareerTimeline)는 order가 아니라 start_date desc로 정렬해서
// 보여준다 — 그래서 여기도 순서 변경 UI 없이 최신순으로만 나열한다.
export function CareerListEditor({ careers }: { careers: Career[] }) {
  const router = useRouter();
  const sorted = [...careers].sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""));
  const [rows, setRows] = useState<Row[]>(
    sorted.map((c) => ({ id: c.id, isNew: false, input: toInput(c) })),
  );
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateRow(id: string, patch: Partial<CareerInput>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, input: { ...r.input, ...patch } } : r)));
  }

  function addRow() {
    const id = `new-${crypto.randomUUID()}`;
    setRows((prev) => [{ id, isNew: true, input: toInput() }, ...prev]);
  }

  function saveRow(row: Row) {
    setErrors((prev) => ({ ...prev, [row.id]: "" }));
    startTransition(async () => {
      const result = row.isNew
        ? await createCareer(row.input)
        : await updateCareer(row.id, row.input);
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [row.id]: result.message }));
        return;
      }
      if (row.isNew) router.refresh();
    });
  }

  function removeRow(row: Row) {
    if (row.isNew) {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      return;
    }
    if (!confirm(`"${row.input.org_name}" 연혁을 삭제할까요?`)) return;
    startTransition(async () => {
      const result = await deleteCareer(row.id);
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [row.id]: result.message }));
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[var(--color-line)] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-[var(--color-text)]">연혁</h2>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-line)] px-3.5 text-[12px] font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          + 새 항목 추가
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-[var(--color-line)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
          등록된 연혁이 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 rounded-[12px] border border-[var(--color-line)] p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectField
                  label="구분"
                  value={row.input.type}
                  onChange={(v) => updateRow(row.id, { type: v })}
                  options={TYPE_OPTIONS}
                />
                <TextField
                  label="기관명"
                  value={row.input.org_name}
                  onChange={(v) => updateRow(row.id, { org_name: v })}
                />
                <TextField
                  label="직함/학위"
                  value={row.input.title ?? ""}
                  onChange={(v) => updateRow(row.id, { title: v || null })}
                />
                <TextField
                  label="업종"
                  hint="회사 연혁에만 사용"
                  value={row.input.industry ?? ""}
                  onChange={(v) => updateRow(row.id, { industry: v || null })}
                />
                <div className="sm:col-span-2">
                  <DateRangeField
                    label="기간"
                    startValue={row.input.start_date ?? ""}
                    endValue={row.input.end_date ?? ""}
                    ongoing={Boolean(row.input.start_date && !row.input.end_date)}
                    onStartChange={(v) => updateRow(row.id, { start_date: v || null })}
                    onEndChange={(v) => updateRow(row.id, { end_date: v || null })}
                    onOngoingChange={(ongoing) => updateRow(row.id, { end_date: ongoing ? null : row.input.end_date })}
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <FieldLabel hint="학원 유형은 자격증명, 그 외는 상세 설명">설명</FieldLabel>
                  <textarea
                    value={row.input.description ?? ""}
                    onChange={(event) => updateRow(row.id, { description: event.target.value || null })}
                    rows={2}
                    className="resize-none rounded-[10px] border border-[var(--color-line)] bg-white p-3 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isPending || !row.input.org_name}
                  onClick={() => saveRow(row)}
                  className="inline-flex h-8 items-center justify-center rounded-full bg-[var(--color-accent)] px-4 text-[12px] font-semibold text-[var(--color-accent-ink)] disabled:opacity-50"
                >
                  {row.isNew ? "등록" : "저장"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => removeRow(row)}
                  className="text-[12px] text-red-600 hover:underline disabled:opacity-50"
                >
                  삭제
                </button>
                {errors[row.id] && <p className="text-[12px] text-red-600">{errors[row.id]}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
