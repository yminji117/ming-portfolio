import Link from "next/link";
import { MediaThumb } from "@/components/media-thumb";
import { Tag } from "@/components/tag";
import { formatYear } from "@/lib/format";
import { getStudyHref } from "@/lib/study";
import type { Study } from "@/lib/types";

// PRD 6.3 — /study 리스트 카드: Works와 동일 그리드·카드 규칙, 외부 링크형은 바로 새 탭 이동
export function StudyListCard({ study }: { study: Study }) {
  const { href, isExternal } = getStudyHref(study);
  const year = formatYear(study.published_at);
  const tags = study.tags.slice(0, 2);

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex flex-col gap-3"
    >
      <MediaThumb
        src={study.thumbnail_url}
        alt={study.title}
        showOverlay
        className="aspect-[3/4] border border-[var(--color-line)]"
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[length:var(--fs-body)] font-medium">{study.title}</p>
          {year && (
            <span className="shrink-0 text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
              {year}
            </span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
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
