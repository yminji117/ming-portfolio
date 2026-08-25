export function StatTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  tone?: "neutral" | "accent" | "warn";
}) {
  const toneClass =
    tone === "accent"
      ? "text-[var(--color-accent)]"
      : tone === "warn"
        ? "text-[#a8660f]"
        : "text-[var(--color-text)]";

  return (
    <div className="flex flex-col gap-2 rounded-[16px] border border-[var(--color-line)] bg-white p-5 shadow-[0_1px_2px_rgba(19,20,23,0.04)]">
      <span className="text-[13px] text-[var(--color-text-muted)]">{label}</span>
      <span className={`text-[32px] font-bold tabular-nums ${toneClass}`}>{value}</span>
    </div>
  );
}
