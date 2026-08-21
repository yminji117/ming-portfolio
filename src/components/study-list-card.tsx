import Image from "next/image";
import Link from "next/link";
import { Tag } from "@/components/tag";
import { getStudyHref } from "@/lib/study";
import type { Study } from "@/lib/types";

// Figma '최종' Study 리스트 카드 — Works와 달리 이미지-좌/본문-우 가로형, 회색 테두리
export function StudyListCard({ study }: { study: Study }) {
  const { href, isExternal } = getStudyHref(study);
  const date = study.published_at.replaceAll("-", ".");
  const tags = study.tags.slice(0, 2);

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex gap-4 rounded-[var(--radius)] border border-[var(--color-line)] p-3 transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] sm:gap-6 sm:p-4"
    >
      <div className="relative aspect-video w-[160px] shrink-0 overflow-hidden rounded-[4px] bg-[#707070] sm:w-[240px]">
        {study.thumbnail_url ? (
          <Image
            src={study.thumbnail_url}
            alt={study.title}
            fill
            sizes="(min-width: 640px) 240px, 160px"
            className="object-cover transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[16px] font-light text-[#323232]">
            img
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Tag key={tag} className="text-[var(--color-ink)]">
                {tag}
              </Tag>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <p className="text-[16px] font-bold text-[var(--color-text)]">{study.title}</p>
          {study.summary && (
            <p className="text-[14px] text-[var(--color-ink)]">{study.summary}</p>
          )}
          <p className="text-[12px] text-[var(--color-text-muted)]">{date}</p>
        </div>
      </div>
    </Link>
  );
}
