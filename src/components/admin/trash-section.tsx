"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type TrashItem = { id: string; label: string; deletedAt: string };
type ActionResult = { ok: true } | { ok: false; message: string };

function daysSince(iso: string): number {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function TrashSection({
  title,
  items,
  emptyText,
  onRestore,
  onPermanentDelete,
}: {
  title: string;
  items: TrashItem[];
  emptyText: string;
  onRestore: (id: string) => Promise<ActionResult>;
  onPermanentDelete: (id: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function run(id: string, action: () => Promise<ActionResult>) {
    setErrors((prev) => ({ ...prev, [id]: "" }));
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [id]: result.message }));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[var(--color-line)] bg-white p-5">
      <h2 className="text-[14px] font-bold text-[var(--color-text)]">
        {title} <span className="font-normal text-[var(--color-text-muted)]">({items.length})</span>
      </h2>

      {items.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-[var(--color-line)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
          {emptyText}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const elapsed = daysSince(item.deletedAt);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-line)] px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-[var(--color-text)]">{item.label}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    삭제 {elapsed === 0 ? "오늘" : `${elapsed}일 전`}
                  </p>
                  {errors[item.id] && <p className="text-[11px] text-red-600">{errors[item.id]}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => run(item.id, () => onRestore(item.id))}
                    className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-line)] px-3 text-[12px] font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
                  >
                    복구
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm(`"${item.label}"을(를) 완전히 삭제할까요? 되돌릴 수 없어요.`)) return;
                      run(item.id, () => onPermanentDelete(item.id));
                    }}
                    className="inline-flex h-8 items-center justify-center rounded-full px-3 text-[12px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    완전 삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
