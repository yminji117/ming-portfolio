"use client";

import { useState, useTransition } from "react";
import { loadMoreProjects } from "@/app/works/actions";
import { WorksListGrid } from "@/components/works-list-grid";
import { WorksProfessionalGrid } from "@/components/works-professional-grid";
import type { Project, ProjectCategory } from "@/lib/types";

export function WorksListClient({
  category,
  initialItems,
  total,
}: {
  category: ProjectCategory;
  initialItems: Project[];
  total: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="py-20 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
        아직 등록된 프로젝트가 없어요.
      </p>
    );
  }

  const hasMore = items.length < total;

  function handleLoadMore() {
    startTransition(async () => {
      const next = await loadMoreProjects(category, items.length);
      setItems((prev) => [...prev, ...next.items]);
    });
  }

  return (
    <div className="flex flex-col items-center gap-10">
      {category === "professional" ? (
        // Main "Woke Professionel" 카드/필터 UI를 그대로 재사용 — 회사명 대신 기간을 표시한다.
        <WorksProfessionalGrid projects={items} cardMetaField="period" />
      ) : (
        <WorksListGrid projects={items} />
      )}
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
