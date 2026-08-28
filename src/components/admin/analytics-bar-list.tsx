export function AnalyticsBarList({
  items,
  emptyLabel = "데이터가 아직 없어요.",
}: {
  items: { label: string; count: number }[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-[13px] text-[var(--color-text-muted)]">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-[var(--color-text)]">{item.label}</span>
            <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[var(--color-text)]">
              {item.count.toLocaleString("ko-KR")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-line)]">
            <div
              className="h-2 rounded-full bg-[var(--color-accent)]"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
