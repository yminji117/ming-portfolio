export default function Loading() {
  return (
    <div
      className="container-app max-w-[720px] animate-pulse py-10 pt-16 lg:py-16 lg:pt-[60px]"
      aria-hidden="true"
    >
      <div className="h-10 w-40 rounded bg-[var(--color-line)]" />
      <div className="mt-10 h-40 rounded bg-[var(--color-line)] lg:mt-14" />
    </div>
  );
}
