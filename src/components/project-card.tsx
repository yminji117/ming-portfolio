import Link from "next/link";
import { MediaThumb } from "@/components/media-thumb";
import { formatCareerRange, getIndustryLabel, getResultPreview } from "@/lib/format";
import type { Project } from "@/lib/types";

// Works Professional 카드 — industry 필터에 매칭되면 화이트, 아니면 블랙 상태를 유지한다(숨기지 않음).
// metaField로 상단 보조 텍스트를 회사명(Main 기본값)/기간(/works 리스트) 중 선택한다.
export function ProjectCard({
  project,
  active,
  metaField = "company",
}: {
  project: Project;
  active: boolean;
  metaField?: "company" | "period";
}) {
  const tags = [
    project.role[0],
    project.industry ? getIndustryLabel(project.industry) : null,
  ].filter(Boolean) as string[];

  const metaText =
    metaField === "period"
      ? formatCareerRange(project.start_date, project.end_date)
      : project.company;

  const resultPreview = getResultPreview(project.result);

  return (
    <Link
      href={`/works/${project.slug}`}
      className={`group flex flex-col gap-3 rounded-[var(--radius)] border p-4 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:border-[var(--color-accent)] ${
        active ? "border-black bg-white text-black" : "border-white bg-black text-white"
      }`}
    >
      <div className="relative aspect-[285/160]">
        <MediaThumb
          src={project.thumbnail_url}
          alt={project.title}
          bare
          theme={active ? "light" : "dark"}
          className="h-full w-full"
        />
        {tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {metaText && (
            <p className={`text-[14px] ${active ? "text-black" : "text-white"}`}>
              {metaText}
            </p>
          )}
          <p className="text-[20px] font-bold">{project.title}</p>
          <p className={`text-[14px] ${active ? "text-[#6b6b6b]" : "text-[#a9a9a9]"}`}>
            {project.summary}
          </p>
        </div>
        {resultPreview && (
          <div className="flex items-center justify-between gap-2">
            <p className={`truncate text-[16px] ${active ? "text-black" : "text-white"}`}>
              {resultPreview.text}
            </p>
            {resultPreview.remainingCount > 0 && (
              <span
                className={`shrink-0 rounded-[4px] px-[4px] py-[2px] text-[12px] ${
                  active ? "bg-[#0a0a0a] text-white" : "bg-white text-black"
                }`}
              >
                +{resultPreview.remainingCount}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
