"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createCurrentlyDoing,
  deleteCurrentlyDoing,
  reorderCurrentlyDoing,
  updateCurrentlyDoing,
  type CurrentlyDoingInput,
} from "@/app/admin/(protected)/currently-doing/actions";
import type {
  CurrentlyCategory,
  CurrentlyDoing,
  CurrentlyLabel,
  CurrentlyRefType,
} from "@/lib/types";

const CATEGORY_OPTIONS: { value: CurrentlyCategory; label: string }[] = [
  { value: "works", label: "Works" },
  { value: "study", label: "Study" },
  { value: "side", label: "Side" },
];

const LABEL_OPTIONS: { value: CurrentlyLabel; label: string }[] = [
  { value: "want", label: "대기" },
  { value: "doing", label: "진행중" },
  { value: "done", label: "완료" },
];

const REF_TYPE_OPTIONS: { value: CurrentlyRefType; label: string }[] = [
  { value: "none", label: "없음" },
  { value: "project", label: "프로젝트" },
  { value: "study", label: "스터디" },
];

const selectClass =
  "h-9 rounded-[8px] border border-[var(--color-line)] bg-white px-2 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]";
const inputClass =
  "h-9 w-full rounded-[8px] border border-[var(--color-line)] bg-white px-2 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]";

type Row = { id: string; isNew: boolean; input: CurrentlyDoingInput };

function toInput(item?: CurrentlyDoing): CurrentlyDoingInput {
  return {
    category: item?.category ?? "works",
    title: item?.title ?? "",
    label: item?.label ?? "want",
    start_date: item?.start_date ?? null,
    end_date: item?.end_date ?? null,
    ref_type: item?.ref_type ?? "none",
    ref_id: item?.ref_id ?? null,
    is_visible: item?.is_visible ?? true,
    order: item?.order ?? null,
  };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function CurrentlyDoingEditor({
  items,
  projects,
  studies,
}: {
  items: CurrentlyDoing[];
  projects: { id: string; title: string }[];
  studies: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(
    items.map((item) => ({ id: item.id, isNew: false, input: toInput(item) })),
  );
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = todayIso();

  function patchLocal(id: string, patch: Partial<CurrentlyDoingInput>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, input: { ...r.input, ...patch } } : r)));
  }

  // 기존 행: 바로 저장. 새 행: 로컬 상태만 바꾸고 "등록" 버튼을 눌러야 실제로 생성된다
  // (title이 비어있는 상태로 저장을 시도하면 DB not-null 제약에 걸린다).
  function save(row: Row, patch: Partial<CurrentlyDoingInput>) {
    patchLocal(row.id, patch);
    if (row.isNew) return;
    setErrors((prev) => ({ ...prev, [row.id]: "" }));
    startTransition(async () => {
      const result = await updateCurrentlyDoing(row.id, patch);
      if (!result.ok) setErrors((prev) => ({ ...prev, [row.id]: result.message }));
    });
  }

  function addRow() {
    const id = `new-${crypto.randomUUID()}`;
    setRows((prev) => [{ id, isNew: true, input: toInput() }, ...prev]);
  }

  function submitNewRow(row: Row) {
    if (!row.input.title.trim()) return;
    setErrors((prev) => ({ ...prev, [row.id]: "" }));
    startTransition(async () => {
      const result = await createCurrentlyDoing(row.input);
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [row.id]: result.message }));
        return;
      }
      router.refresh();
    });
  }

  function removeRow(row: Row) {
    if (row.isNew) {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      return;
    }
    if (!confirm(`"${row.input.title}" 항목을 삭제할까요?`)) return;
    startTransition(async () => {
      const result = await deleteCurrentlyDoing(row.id);
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [row.id]: result.message }));
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    startTransition(async () => {
      // 아직 등록 안 된(new-<uuid>) 행은 DB에 없는 id라 reorder 대상에서 제외한다 —
      // 안 그러면 그 항목만 update가 실패하면서 나머지는 이미 반영돼 부분 반영 상태가 된다.
      const persistedIds = next.filter((r) => !r.isNew).map((r) => r.id);
      const result = await reorderCurrentlyDoing(persistedIds);
      if (!result.ok) setErrors((prev) => ({ ...prev, _reorder: result.message }));
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[var(--color-line)] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-[var(--color-text)]">목록</h2>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-line)] px-3.5 text-[12px] font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          + 행 추가
        </button>
      </div>
      {errors._reorder && <p className="text-[12px] text-red-600">{errors._reorder}</p>}

      {rows.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-[var(--color-line)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
          등록된 항목이 없어요.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-[12px] text-[var(--color-text-muted)]">
                <th className="w-[90px] py-2 pr-2 font-medium">카테고리</th>
                <th className="min-w-[160px] py-2 pr-2 font-medium">리스트 명</th>
                <th className="w-[100px] py-2 pr-2 font-medium">라벨</th>
                <th className="w-[130px] py-2 pr-2 font-medium">시작일</th>
                <th className="w-[130px] py-2 pr-2 font-medium">종료일</th>
                <th className="w-[64px] py-2 pr-2 font-medium">노출</th>
                <th className="w-[190px] py-2 pr-2 font-medium">연결</th>
                <th className="w-[72px] py-2 pr-2 font-medium">순서</th>
                <th className="w-[56px] py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const overdue =
                  !row.isNew &&
                  row.input.label === "doing" &&
                  row.input.end_date != null &&
                  row.input.end_date < today;
                const refOptions = row.input.ref_type === "project" ? projects : studies;

                return (
                  <tr
                    key={row.id}
                    className={`border-b border-[var(--color-line)] align-top ${
                      overdue ? "bg-amber-50" : ""
                    }`}
                  >
                    <td className="py-2 pr-2">
                      <select
                        value={row.input.category}
                        onChange={(e) => save(row, { category: e.target.value as CurrentlyCategory })}
                        className={selectClass}
                      >
                        {CATEGORY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        defaultValue={row.input.title}
                        placeholder="리스트 명"
                        onBlur={(e) => {
                          const title = e.target.value.trim();
                          if (title === row.input.title) return;
                          save(row, { title });
                        }}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <div className="flex flex-col gap-1">
                        <select
                          value={row.input.label}
                          onChange={(e) => save(row, { label: e.target.value as CurrentlyLabel })}
                          className={selectClass}
                        >
                          {LABEL_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {overdue && (
                          <button
                            type="button"
                            onClick={() => save(row, { label: "done" })}
                            className="w-fit rounded-[6px] bg-amber-400 px-2 py-0.5 text-[11px] font-medium text-amber-950 hover:bg-amber-300"
                          >
                            완료로 변경할까요?
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="date"
                        defaultValue={row.input.start_date ?? ""}
                        onBlur={(e) => {
                          const value = e.target.value || null;
                          if (value === row.input.start_date) return;
                          save(row, { start_date: value });
                        }}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="date"
                        defaultValue={row.input.end_date ?? ""}
                        onBlur={(e) => {
                          const value = e.target.value || null;
                          if (value === row.input.end_date) return;
                          save(row, { end_date: value });
                        }}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={row.input.is_visible}
                        onChange={(e) => save(row, { is_visible: e.target.checked })}
                        className="h-4 w-4 accent-[var(--color-accent)]"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <div className="flex flex-col gap-1">
                        <select
                          value={row.input.ref_type}
                          onChange={(e) => {
                            const ref_type = e.target.value as CurrentlyRefType;
                            save(row, { ref_type, ref_id: ref_type === "none" ? null : row.input.ref_id });
                          }}
                          className={selectClass}
                        >
                          {REF_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {row.input.ref_type !== "none" && (
                          <select
                            value={row.input.ref_id ?? ""}
                            onChange={(e) => save(row, { ref_id: e.target.value || null })}
                            className={selectClass}
                          >
                            <option value="">선택 안 함</option>
                            {refOptions.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.title}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={isPending || index === 0 || row.isNew}
                          onClick={() => move(index, -1)}
                          className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#f3f4f7] disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={isPending || index === rows.length - 1 || row.isNew}
                          onClick={() => move(index, 1)}
                          className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#f3f4f7] disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td className="py-2">
                      {row.isNew ? (
                        <button
                          type="button"
                          disabled={isPending || !row.input.title.trim()}
                          onClick={() => submitNewRow(row)}
                          className="inline-flex h-8 items-center justify-center rounded-full bg-[var(--color-accent)] px-3 text-[12px] font-semibold text-[var(--color-accent-ink)] disabled:opacity-50"
                        >
                          등록
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => removeRow(row)}
                          className="text-[12px] text-red-600 hover:underline disabled:opacity-50"
                        >
                          삭제
                        </button>
                      )}
                      {errors[row.id] && (
                        <p className="mt-1 max-w-[120px] text-[11px] text-red-600">{errors[row.id]}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
