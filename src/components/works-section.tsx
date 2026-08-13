import { MoreLink } from "@/components/more-link";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { WorksProfessionalGrid } from "@/components/works-professional-grid";
import type { Project } from "@/lib/types";

export function WorksSection({
  theme,
  sub,
  projects,
  moreHref,
}: {
  theme: "dark" | "light";
  sub: "professional" | "side";
  projects: Project[];
  moreHref: string;
}) {
  // PRD 5.0 — 콘텐츠 0건이면 섹션 전체 비노출
  if (projects.length === 0) return null;

  if (theme === "dark") {
    return (
      <section className="section-block bg-[var(--color-ink)] text-white">
        <div className="container-app">
          <Reveal>
            <div className="flex items-start justify-between gap-6">
              <h2 className="section-heading">Works</h2>
              <div className="flex items-center gap-4">
                <span className="eyebrow text-white/60">{sub}</span>
                <MoreLink href={moreHref} variant="icon" className="text-white" />
              </div>
            </div>
          </Reveal>

          <WorksProfessionalGrid projects={projects} />
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container-app">
        <Reveal>
          <div className="flex items-start justify-between gap-6">
            <h2 className="section-heading">
              Works <span className="ml-2 text-[length:var(--fs-sub)] font-normal text-[var(--color-text-muted)]">{sub}</span>
            </h2>
            <MoreLink href={moreHref} variant="icon" />
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, i) => (
            <Reveal key={project.id} index={i}>
              <ProjectCard project={project} theme="light" index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
