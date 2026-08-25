import Link from "next/link";
import { MediaThumb } from "@/components/media-thumb";
import { Reveal } from "@/components/reveal";
import type { Project } from "@/lib/types";

export function WorksSideGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-12 lg:grid-cols-2 lg:gap-5">
      {projects.map((project, i) => (
        <Reveal key={project.id} index={i}>
          <Link href={`/works/${project.slug}`} className="group block">
            <MediaThumb
              src={project.thumbnail_url}
              alt={project.title}
              className="aspect-[650/453] border border-solid border-[#EBEEF5]"
            />
            <div className="mt-[10px] flex flex-col gap-2 border-t border-black pt-[18px]">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl">{project.title}</h3>
              </div>
              <p className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                {project.summary}
              </p>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
