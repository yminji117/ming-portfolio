"use client";

import { useMemo, useState, useTransition } from "react";
import { featureItem, swapFeaturedOrder, unfeatureItem } from "@/app/admin/(protected)/main/actions";

export type FeaturedManagerItem = {
  id: string;
  title: string;
  is_featured: boolean;
  featured_order: number | null;
};

// Professional/Side/Study 공용 — PRD 9.4. 정원 초과/draft 노출 차단은 DB 트리거
// (enforce_featured_cap)가 최종 방어선이고, 여기 UI는 cap 도달 시 버튼만 비활성화해 미리 막는다.
export function FeaturedManager({
  table,
  cap,
  items,
}: {
  table: "projects" | "studies";
  cap: number;
  items: FeaturedManagerItem[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const featured = useMemo(
    () =>
      items
        .filter((i) => i.is_featured)
        .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0)),
    [items],
  );
  const available = useMemo(() => items.filter((i) => !i.is_featured), [items]);

  const atCap = featured.length >= cap;

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.message ?? "처리에 실패했어요.");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {featured.length === 0 && (
          <p className="rounded-[10px] border border-dashed border-[var(--color-line)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
            노출 중인 항목이 없어요.
          </p>
        )}
        {featured.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-[var(--color-accent-ink)] tabular-nums">
                {index + 1}
              </span>
              <span className="text-[13px] font-medium text-[var(--color-text)]">{item.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isPending || index === 0}
                onClick={() => run(() => swapFeaturedOrder(table, item.id, featured[index - 1].id))}
                className="h-7 w-7 rounded-full text-[13px] text-[var(--color-accent)] hover:bg-white/60 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={isPending || index === featured.length - 1}
                onClick={() => run(() => swapFeaturedOrder(table, item.id, featured[index + 1].id))}
                className="h-7 w-7 rounded-full text-[13px] text-[var(--color-accent)] hover:bg-white/60 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => unfeatureItem(table, item.id))}
                className="ml-1 h-7 rounded-full bg-white px-3 text-[12px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                해제
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-[12px] text-red-600">{error}</p>}

      {available.length > 0 && (
        <details className="rounded-[10px] border border-[var(--color-line)] bg-white">
          <summary className="cursor-pointer px-4 py-2.5 text-[12px] font-medium text-[var(--color-text-muted)]">
            노출 가능한 published 항목 {available.length}건
          </summary>
          <div className="flex flex-col gap-1.5 border-t border-[var(--color-line-soft,var(--color-line))] p-3">
            {available.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-1 py-1.5">
                <span className="truncate text-[13px] text-[var(--color-text)]">{item.title}</span>
                <button
                  type="button"
                  disabled={isPending || atCap}
                  onClick={() => run(() => featureItem(table, item.id))}
                  className="shrink-0 rounded-full border border-[var(--color-line)] px-3 py-1 text-[12px] font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-30"
                >
                  노출
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
