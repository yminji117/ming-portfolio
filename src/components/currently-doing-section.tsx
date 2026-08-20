import { Reveal } from "@/components/reveal";
import { CurrentlyDoingFilterableList } from "@/components/currently-doing-filterable-list";
import { CurrentlyRow } from "@/components/currently-row";
import { SectionHeading } from "@/components/section-heading";
import type { CurrentlyDoing } from "@/lib/types";

// PRD 5.7(Main, limit 있음) / 6.4(About, filterable=true로 전체 노출 + 라벨 필터)
export function CurrentlyDoingSection({
  items,
  filterable = false,
  moreHref = "/about#currently",
  id,
}: {
  items: CurrentlyDoing[];
  filterable?: boolean;
  moreHref?: string;
  id?: string;
}) {
  // PRD 5.0 — 0건이면 섹션 비노출
  if (items.length === 0) return null;

  return (
    <section id={id} className="border-t border-[var(--color-line)] py-20 lg:py-[140px]">
      <div className="container-app">
        <SectionHeading title="Currently Doing" moreHref={moreHref} theme="light" />

        {filterable ? (
          <CurrentlyDoingFilterableList items={items} />
        ) : (
          <div className="mt-8 divide-y divide-[#e5e5e0] border-t border-black border-b border-b-[#e5e5e0] lg:mt-12">
            {items.map((item, i) => (
              <Reveal key={item.id} index={i}>
                <CurrentlyRow item={item} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
