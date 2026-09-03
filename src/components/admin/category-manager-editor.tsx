"use client";

import { useState, useTransition } from "react";
import {
  createCategory,
  deleteCategory,
  renameCategory,
  reorderCategories,
} from "@/app/admin/(protected)/categories/actions";
import { moveItem } from "@/lib/array-utils";
import type { Category, CategoryScope } from "@/lib/types";

// resetKey: rename 실패 시 defaultValue 입력창은 저절로 되돌아오지 않아 강제로 리마운트한다
// (currently-doing-editor.tsx와 동일한 이유).
type Row = Category & { resetKey: number };

export function CategoryManagerEditor({
  scope,
  title,
  items,
}: {
  scope: CategoryScope;
  title: string;
  items: Category[];
}) {
  const [rows, setRows] = useState<Row[]>(items.map((item) => ({ ...item, resetKey: 0 })));
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addCategory() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setErrors((prev) => ({ ...prev, _add: "" }));
    startTransition(async () => {
      const result = await createCategory(scope, trimmed);
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, _add: result.message }));
        return;
      }
      setNewName("");
      setRows((prev) => [...prev, { ...result.category, resetKey: 0 }]);
    });
  }

  function rename(row: Row, name: string) {
    if (name === row.name) return;
    setErrors((prev) => ({ ...prev, [row.id]: "" }));
    startTransition(async () => {
      const result = await renameCategory(row.id, name);
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [row.id]: result.message }));
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, resetKey: r.resetKey + 1 } : r)));
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, name } : r)));
    });
  }

  function remove(row: Row) {
    if (!confirm(`"${row.name}" 카테고리를 삭제할까요?`)) return;
    setErrors((prev) => ({ ...prev, [row.id]: "" }));
    startTransition(async () => {
      const result = await deleteCategory(row.id);
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [row.id]: result.message }));
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    });
  }

  function move(index: number, direction: -1 | 1) {
    const next = moveItem(rows, index, direction);
    if (next === rows) return;
    setRows(next);
    startTransition(async () => {
      const result = await reorderCategories(next.map((r) => r.id));
      if (!result.ok) setErrors((prev) => ({ ...prev, _reorder: result.message }));
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[var(--color-line)] bg-white p-5">
      <h2 className="text-[14px] font-bold text-[var(--color-text)]">{title}</h2>
      {errors._reorder && <p className="text-[12px] text-red-600">{errors._reorder}</p>}

      {rows.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-[var(--color-line)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
          등록된 카테고리가 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map((row, index) => (
            <div key={row.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 rounded-[8px] border border-[var(--color-line)] bg-[#fafbfd] px-3 py-1.5">
                <input
                  key={`${row.id}:${row.resetKey}`}
                  type="text"
                  defaultValue={row.name}
                  onBlur={(e) => rename(row, e.target.value.trim() || row.name)}
                  className="h-8 flex-1 rounded-[6px] border border-transparent bg-transparent px-1 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                />
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={isPending || index === 0}
                    onClick={() => move(index, -1)}
                    className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#eceef3] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={isPending || index === rows.length - 1}
                    onClick={() => move(index, 1)}
                    className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#eceef3] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => remove(row)}
                    className="h-7 rounded-full px-2 text-[12px] text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
              {errors[row.id] && <p className="px-1 text-[11px] text-red-600">{errors[row.id]}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-[var(--color-line)] pt-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCategory();
            }
          }}
          placeholder="새 카테고리 이름"
          className="h-9 flex-1 rounded-[8px] border border-[var(--color-line)] bg-white px-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="button"
          disabled={isPending || !newName.trim()}
          onClick={addCategory}
          className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--color-accent)] px-4 text-[12px] font-semibold text-[var(--color-accent-ink)] disabled:opacity-50"
        >
          추가
        </button>
      </div>
      {errors._add && <p className="text-[12px] text-red-600">{errors._add}</p>}
    </div>
  );
}
