"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import type { Project } from "@/lib/types";

const ALL = "전체";

export function WorksProfessionalGrid({ projects }: { projects: Project[] }) {
  const tags = useMemo(() => {
    const unique = new Set<string>();
    projects.forEach((project) => project.tools.forEach((tool) => unique.add(tool)));
    return [ALL, ...Array.from(unique)];
  }, [projects]);

  const [active, setActive] = useState(ALL);

  const visible =
    active === ALL ? projects : projects.filter((p) => p.tools.includes(active));

  return (
    <>
      {tags.length > 2 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActive(tag)}
              className={`rounded-full border px-4 py-1.5 text-[length:var(--fs-caption)] transition-colors duration-[var(--dur-fast)] ${
                active === tag
                  ? "border-white bg-white text-[var(--color-ink)]"
                  : "border-white/40 text-white/80 hover:border-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project, i) => (
          <Reveal key={project.id} index={i}>
            <ProjectCard project={project} theme="dark" index={i} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
