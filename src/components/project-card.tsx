import Link from "next/link";
import { MediaThumb } from "@/components/media-thumb";
import { getIndustryLabel } from "@/lib/format";
import type { Project } from "@/lib/types";

// Works Professional 카드 — industry 필터에 매칭되면 화이트, 아니면 블랙 상태를 유지한다(숨기지 않음).
export function ProjectCard({
  project,
  active,
}: {
  project: Project;
  active: boolean;
}) {
  const tags = [
    project.role[0],
    project.industry ? getIndustryLabel(project.industry) : null,
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/works/${project.slug}`}
      className={`group flex flex-col gap-3 rounded-[var(--radius)] border p-4 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:border-[var(--color-accent)] ${
        active ? "border-black bg-white text-black" : "border-white bg-black text-white"
      }`}
    >
      <MediaThumb
        src={project.thumbnail_url}
        alt={project.title}
        bare
        theme={active ? "light" : "dark"}
        className="aspect-[285/160]"
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {project.company && (
            <p className={`text-[length:var(--fs-body)] ${active ? "text-black" : "text-white"}`}>
              {project.company}
            </p>
          )}
          <p className="text-[20px] font-medium">{project.title}</p>
          <p className={`text-[length:var(--fs-body)] ${active ? "text-[#6b6b6b]" : "text-[#a9a9a9]"}`}>
            {project.summary}
          </p>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center rounded-full border px-[17px] py-[5px] text-[length:var(--fs-body)] ${
                  active ? "border-black bg-white text-black" : "border-white bg-[#0a0a0a] text-white"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
