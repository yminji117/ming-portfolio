export default function Loading() {
  return (
    <div className="container-app flex animate-pulse flex-col gap-10 py-10 lg:gap-16 lg:py-16" aria-hidden="true">
      <div className="h-8 w-24 rounded-[6px] bg-[var(--color-line)]" />
      <div className="flex flex-col gap-10">
        <div className="h-[140px] w-full rounded-[var(--radius)] bg-[var(--color-line)] sm:h-[180px] lg:h-[200px]" />
        <div className="h-10 w-2/3 rounded bg-[var(--color-line)]" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
          <div className="h-40 rounded bg-[var(--color-line)]" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-1/3 rounded bg-[var(--color-line)]" />
            <div className="h-4 w-full rounded bg-[var(--color-line)]" />
            <div className="h-4 w-5/6 rounded bg-[var(--color-line)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
