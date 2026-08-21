// /study 리스트 라우트 loading.tsx에서 사용 — 가로형 카드 형태에 맞춘 스켈레톤
export function StudyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse gap-4 rounded-[var(--radius)] border border-[var(--color-line)] p-3 sm:gap-6 sm:p-4"
        >
          <div className="aspect-video w-[160px] shrink-0 rounded-[4px] bg-[var(--color-line)] sm:w-[240px]" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-6 w-16 rounded-full bg-[var(--color-line)]" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-3/4 rounded bg-[var(--color-line)]" />
              <div className="h-3 w-full rounded bg-[var(--color-line)]" />
              <div className="h-3 w-1/3 rounded bg-[var(--color-line)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
