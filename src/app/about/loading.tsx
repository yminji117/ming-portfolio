export default function Loading() {
  return (
    <div className="container-app animate-pulse py-10 pt-16 lg:py-16 lg:pt-[60px]" aria-hidden="true">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
        <div className="aspect-[280/350] w-full max-w-[280px] shrink-0 rounded-[var(--radius)] bg-[var(--color-line)]" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-10 w-48 rounded bg-[var(--color-line)]" />
          <div className="h-6 w-32 rounded bg-[var(--color-line)]" />
          <div className="mt-6 h-40 rounded bg-[var(--color-line)]" />
        </div>
      </div>
    </div>
  );
}
