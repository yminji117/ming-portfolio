import Image from "next/image";
import Link from "next/link";
import { Tag } from "@/components/tag";
import { formatProjectRange, getIndustryLabel } from "@/lib/format";
import type { Project } from "@/lib/types";

// Figma '최종' Works 리스트 카드: 16:9 썸네일 + 기간 + 제목 + 한 줄 요약 + 태그 2개, 흰 배경 + 검은 테두리
export function WorksListCard({ project }: { project: Project }) {
  const period = formatProjectRange(project.start_date, project.end_date);
  const tags = [
    project.role[0],
    project.industry ? getIndustryLabel(project.industry) : null,
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/works/${project.slug}`}
      className="group flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--color-ink)] p-4 transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)]"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[4px] bg-[#707070]">
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
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {period && (
            <p className="text-[12px] text-[var(--color-text-muted)]">{period}</p>
          )}
          <p className="text-[16px] font-bold text-[var(--color-text)]">{project.title}</p>
          {project.summary && (
            <p className="text-[14px] text-[var(--color-ink)]">{project.summary}</p>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 2).map((tag) => (
              <Tag key={tag} className="text-[var(--color-ink)]">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
