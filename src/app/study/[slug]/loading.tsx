export default function Loading() {
  return (
    <div className="container-app animate-pulse py-10 pt-16 lg:py-16 lg:pt-[60px]" aria-hidden="true">
      <div className="h-10 w-1/2 rounded bg-[var(--color-line)]" />
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
        <div className="h-24 rounded bg-[var(--color-line)]" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-full rounded bg-[var(--color-line)]" />
          <div className="h-4 w-5/6 rounded bg-[var(--color-line)]" />
        </div>
      </div>
    </div>
  );
}
