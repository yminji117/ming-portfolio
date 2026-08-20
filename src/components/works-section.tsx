import { SectionHeading } from "@/components/section-heading";
import { WorksProfessionalGrid } from "@/components/works-professional-grid";
import { WorksSideGrid } from "@/components/works-side-grid";
import type { Project } from "@/lib/types";

export function WorksSection({
  theme,
  projects,
  moreHref,
}: {
  theme: "dark" | "light";
  projects: Project[];
  moreHref: string;
}) {
  // PRD 5.0 — 콘텐츠 0건이면 섹션 전체 비노출
  if (projects.length === 0) return null;

  if (theme === "dark") {
    return (
      <section className="relative overflow-hidden bg-[#090909] py-20 text-white lg:py-[160px]">
        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[93px] right-[96px] hidden select-none whitespace-nowrap font-[family-name:var(--font-display)] font-extrabold text-[#1d1d1d] lg:block"
          style={{ fontSize: "clamp(48px, 8vw, 120px)", letterSpacing: "-4px" }}
        >
          PROJECT
        </p>
        <div className="container-app relative">
          <SectionHeading eyebrow="Woke" title="Professionel" moreHref={moreHref} theme="dark" />
          <WorksProfessionalGrid projects={projects} />
        </div>
      </section>
    );
  }

  return (
    <section className="pt-15 pb-20 lg:pt-[80px] lg:pb-[160px]">
      <div className="container-app">
        <SectionHeading eyebrow="Woke" title="Side" moreHref={moreHref} theme="light" />
        <WorksSideGrid projects={projects} />
      </div>
    </section>
  );
}
