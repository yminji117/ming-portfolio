export default function Loading() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-[16/9] w-full bg-[var(--color-line)] lg:aspect-[21/9]" />
      <div className="container-app py-10 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
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
