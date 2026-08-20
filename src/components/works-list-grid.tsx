import { Reveal } from "@/components/reveal";
import { WorksListCard } from "@/components/works-list-card";
import type { Project } from "@/lib/types";

// PRD 6.1 그리드 규칙 — Desktop 5열 / Laptop 4열 / Tablet 3열 / Mobile 2열, gap 24px(PC)/12px(Mobile)
export function WorksListGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
      {projects.map((project, i) => (
        <Reveal key={project.id} index={i % 10}>
          <WorksListCard project={project} />
        </Reveal>
      ))}
    </div>
  );
}
