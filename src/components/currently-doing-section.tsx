import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { formatCurrentlyRange } from "@/lib/format";
import type { CurrentlyDoing } from "@/lib/types";

const LABEL_TEXT: Record<CurrentlyDoing["label"], string> = {
  want: "대기",
  doing: "진행중",
  done: "완료",
};

const LABEL_STYLE: Record<CurrentlyDoing["label"], string> = {
  want: "border border-[#e3e4e7] bg-white text-[var(--color-text)]",
  doing: "bg-black text-white",
  done: "bg-[#cbcbcb] text-[#777777]",
};

export function CurrentlyDoingSection({ items }: { items: CurrentlyDoing[] }) {
  // PRD 5.0 — 0건이면 섹션 비노출
  if (items.length === 0) return null;

  return (
    <section className="section">
      <div className="container-app">
        <SectionHeading title="Currently Doing" moreHref="/about#currently" theme="light" />

        <div className="mt-12 divide-y divide-[#e5e5e0] border-t border-black">
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
      <div className="flex flex-wrap items-center gap-5">
        <span className="w-20 text-[length:var(--fs-body)] uppercase text-[var(--color-text)]">
          {item.category}
        </span>
        <span className="flex flex-wrap items-center gap-4">
          <span
            className={`inline-flex w-[61px] items-center justify-center rounded-[4px] px-2 py-0.5 text-[length:var(--fs-body)] ${LABEL_STYLE[item.label]}`}
          >
            {LABEL_TEXT[item.label]}
          </span>
          <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">{item.title}</span>
        </span>
      </div>
      <span className="text-[length:var(--fs-body)] text-[var(--color-text)]">
        {formatCurrentlyRange(item.start_date, item.end_date)}
      </span>
    </div>
  );
}
