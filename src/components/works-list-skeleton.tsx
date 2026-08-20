// PRD 6.1/6.3 "로딩: 스켈레톤 카드 노출" — /works, /study 리스트 라우트 loading.tsx에서 사용
export function WorksListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-pulse">
          <div className="aspect-[3/4] rounded-[var(--radius-inner)] bg-[var(--color-line)]" />
          <div className="h-4 w-3/4 rounded bg-[var(--color-line)]" />
          <div className="h-3 w-1/2 rounded bg-[var(--color-line)]" />
        </div>
      ))}
    </div>
  );
}
