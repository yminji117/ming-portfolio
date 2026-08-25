import Image from "next/image";
import Link from "next/link";
import {
  formatProjectRange,
  getIndustryLabel,
  getResultPreview,
  normalizeIndustry,
  sortIndustries,
} from "@/lib/format";
import type { Project } from "@/lib/types";

// Figma '최종' Works 리스트 카드: 16:9 썸네일 + 기간 + 제목 + 한 줄 요약 + 태그 2개, 흰 배경 + 검은 테두리
export function WorksListCard({ project }: { project: Project }) {
  const period = formatProjectRange(project.start_date, project.end_date);
  const tags = sortIndustries(normalizeIndustry(project.industry), project.category).map(
    getIndustryLabel,
  );
  const resultPreview = getResultPreview(project.result);

  return (
    <Link
      href={`/works/${project.slug}`}
      className="group flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--color-ink)] p-4 transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)]"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[4px] border border-solid border-[#EBEEF5] bg-[#707070]">
        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[16px] font-light text-[#323232]">
            img
          </span>
        )}
        {tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex h-[24px] items-center justify-center rounded-full border border-[#d2d5db] bg-white/20 px-[13px] text-[12px] text-[#0a0a0a] backdrop-blur-xl"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-[2px]">
            {(project.company || period) && (
              <div className="flex items-center justify-between gap-2">
                {project.company && (
                  <p className="truncate text-[14px] text-[var(--color-text-muted)]">{project.company}</p>
                )}
                {period && (
                  <p className="shrink-0 text-[10px] text-[var(--color-text-muted)]">{period}</p>
                )}
              </div>
            )}
            <p className="text-[20px] font-bold text-[var(--color-text)]">{project.title}</p>
          </div>
          {project.summary && (
            <p className="line-clamp-2 min-h-[2.75em] text-[14px] leading-snug text-[var(--color-text-muted)]">
              {project.summary}
            </p>
          )}
        </div>
        {resultPreview && (
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[16px] text-[var(--color-text)]">{resultPreview.text}</p>
            {resultPreview.remainingCount > 0 && (
              <span className="shrink-0 rounded-[4px] bg-[#0a0a0a] px-[4px] py-[2px] text-[12px] text-white">
                +{resultPreview.remainingCount}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
