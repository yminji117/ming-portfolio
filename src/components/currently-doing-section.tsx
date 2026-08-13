import { MoreLink } from "@/components/more-link";
import { Reveal } from "@/components/reveal";
import { formatCurrentlyRange } from "@/lib/format";
import type { CurrentlyDoing } from "@/lib/types";

const LABEL_TEXT: Record<CurrentlyDoing["label"], string> = {
  want: "대기",
  doing: "진행중",
  done: "완료",
};

const LABEL_STYLE: Record<CurrentlyDoing["label"], string> = {
  want: "border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-text)]",
  doing: "bg-[var(--color-accent)] text-[var(--color-accent-ink)]",
  done: "bg-[var(--color-line)] text-[var(--color-text-muted)]",
};

export function CurrentlyDoingSection({ items }: { items: CurrentlyDoing[] }) {
  // PRD 5.0 — 0건이면 섹션 비노출
  if (items.length === 0) return null;

  return (
    <section className="section">
      <div className="container-app">
        <Reveal>
          <div className="flex items-start justify-between gap-6">
            <h2 className="section-heading">Currently Doing</h2>
            <MoreLink href="/about#currently" variant="icon" />
          </div>
        </Reveal>

        <div className="mt-12 divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
          {items.map((item, i) => (
            <Reveal key={item.id} index={i}>
              <CurrentlyRow item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CurrentlyRow({ item }: { item: CurrentlyDoing }) {
  // ref_id는 uuid PK라 slug 라우트로 바로 연결할 수 없다.
  // Phase 2에서 projects/studies slug를 조인해 조회한 뒤 링크를 연결한다.
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[length:var(--fs-caption)] uppercase text-[var(--color-text-muted)]">
          {item.category}
        </span>
        <span
          className={`rounded-full px-3 py-0.5 text-[length:var(--fs-caption)] ${LABEL_STYLE[item.label]}`}
        >
          {LABEL_TEXT[item.label]}
        </span>
        <span className="text-[length:var(--fs-body)] font-semibold">{item.title}</span>
      </div>
      <span className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
        {formatCurrentlyRange(item.start_date, item.end_date)}
      </span>
    </div>
  );
}
