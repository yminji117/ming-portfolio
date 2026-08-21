import { Reveal } from "@/components/reveal";
import { WorksListCard } from "@/components/works-list-card";
import type { Project } from "@/lib/types";

// Figma '최종' 리스트 그리드 — Mobile 1열 / Tablet 2열 / Desktop 4열, gap 20px
export function WorksListGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {projects.map((project, i) => (
        <Reveal key={project.id} index={i % 8}>
          <WorksListCard project={project} />
        </Reveal>
      ))}
    </div>
  );
}
