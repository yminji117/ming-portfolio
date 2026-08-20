import Link from "next/link";
import { MediaThumb } from "@/components/media-thumb";
import { Tag } from "@/components/tag";
import { formatYear, getIndustryLabel } from "@/lib/format";
import type { Project } from "@/lib/types";

// PRD 6.1 — /works, /study 공용 리스트 카드: 썸네일 3:4 + 제목 + 연도 + 태그 1~2개
export function WorksListCard({ project }: { project: Project }) {
  const year = formatYear(project.start_date);
  const tags = [
    project.role[0],
    project.industry ? getIndustryLabel(project.industry) : null,
  ].filter(Boolean) as string[];

  return (
    <Link href={`/works/${project.slug}`} className="group flex flex-col gap-3">
      <MediaThumb
        src={project.thumbnail_url}
        alt={project.title}
        showOverlay
        className="aspect-[3/4] border border-[var(--color-line)]"
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[length:var(--fs-body)] font-medium">{project.title}</p>
          {year && (
            <span className="shrink-0 text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
              {year}
            </span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 2).map((tag) => (
              <Tag key={tag} className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
