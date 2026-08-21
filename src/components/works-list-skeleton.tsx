// PRD 6.1/6.3 "로딩: 스켈레톤 카드 노출" — /works, /study 리스트 라우트 loading.tsx에서 사용
export function WorksListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col gap-4 rounded-[var(--radius)] border border-[var(--color-line)] p-4"
        >
          <div className="aspect-video w-full rounded-[4px] bg-[var(--color-line)]" />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-1/3 rounded bg-[var(--color-line)]" />
            <div className="h-4 w-3/4 rounded bg-[var(--color-line)]" />
            <div className="h-3 w-full rounded bg-[var(--color-line)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
