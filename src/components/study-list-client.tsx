"use client";

import { useState, useTransition } from "react";
import { loadMoreStudies } from "@/app/study/actions";
import { StudyListGrid } from "@/components/study-list-grid";
import type { Study } from "@/lib/types";

export function StudyListClient({
  initialItems,
  total,
}: {
  initialItems: Study[];
  total: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="py-20 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
        아직 등록된 스터디가 없어요.
      </p>
    );
  }

  const hasMore = items.length < total;

  function handleLoadMore() {
    startTransition(async () => {
      const next = await loadMoreStudies(items.length);
      setItems((prev) => [...prev, ...next.items]);
    });
  }

  return (
    <div className="flex flex-col items-center gap-10">
      <StudyListGrid studies={items} />
      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-line)] px-8 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
        >
          {isPending ? "불러오는 중..." : "Load more"}
        </button>
      )}
    </div>
  );
}
