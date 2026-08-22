import Image from "next/image";
import Link from "next/link";
import type { Study } from "@/lib/types";

// Study 리스트 카드는 항상 내부 상세 페이지로 이동한다 — 외부 링크(external_url)는
// 상세 페이지 안의 동그란 화살표 버튼(ExpandCircleRightIcon)에서만 연결한다.
export function StudyListCard({ study }: { study: Study }) {
  const date = study.published_at.replaceAll("-", ".");
  const tags = study.tags.slice(0, 2);

  return (
    <Link
      href={`/study/${study.slug}`}
      className="group flex gap-4 rounded-[var(--radius)] border border-[var(--color-line)] p-3 transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] sm:gap-6 sm:p-4"
    >
      <div className="relative aspect-square w-[123px] shrink-0 overflow-hidden rounded-[4px] bg-[#707070] sm:w-[135px]">
        {study.thumbnail_url ? (
          <Image
            src={study.thumbnail_url}
            alt={study.title}
            fill
            sizes="(min-width: 640px) 135px, 123px"
            className="object-cover transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[16px] font-light text-[#323232]">
            img
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex flex-col gap-3">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-[24px] items-center justify-center rounded-full border border-[var(--color-ink)] px-[13px] text-[12px] text-[var(--color-ink)] sm:h-[28px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <p className="text-[16px] font-bold text-[var(--color-text)]">{study.title}</p>
            {study.summary && (
              <p className="line-clamp-2 h-[34px] text-[14px] text-[var(--color-ink)]">
                {study.summary}
              </p>
            )}
          </div>
        </div>
        <p className="text-[12px] text-[var(--color-text-muted)]">{date}</p>
      </div>
    </Link>
  );
}
