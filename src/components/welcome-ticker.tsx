const REPEAT_COUNT = 8;

export function WelcomeTicker({ text }: { text: string }) {
  const items = Array.from({ length: REPEAT_COUNT }, () => text);

  return (
    <div
      className="overflow-hidden border-y border-[var(--color-ink-line)] bg-[var(--color-ink)] py-3"
      aria-hidden="true"
    >
      <div className="marquee-track">
        {[items, items].map((group, groupIndex) => (
          <div key={groupIndex} className="flex shrink-0 items-center">
            {group.map((label, i) => (
              <span
                key={i}
                className="flex items-center whitespace-nowrap px-4 text-[length:var(--fs-body)] text-white"
              >
                {label}
                <span className="ml-4 text-[var(--color-accent)]">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
