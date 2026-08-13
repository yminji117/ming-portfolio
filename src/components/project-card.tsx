import Link from "next/link";
import { MediaThumb } from "@/components/media-thumb";
import type { Project } from "@/lib/types";

export function ProjectCard({
  project,
  theme,
  index,
}: {
  project: Project;
  theme: "dark" | "light";
  index: number;
}) {
  if (theme === "dark") {
    return (
      <Link
        href={`/works/${project.slug}`}
        className="group flex flex-col gap-4 rounded-[var(--radius)] border border-white/25 p-5 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:border-white/60"
      >
        <span className="text-[length:var(--fs-body)] text-white/60">
          {String(index + 1).padStart(2, "0")}
        </span>
        <MediaThumb
          src={project.thumbnail_url}
          alt={project.title}
          showOverlay
          bare
          theme="dark"
          className="aspect-[4/3]"
        />
        <p className="text-[length:var(--fs-body)] font-semibold leading-snug text-white">
          {project.summary || project.title}
        </p>
      </Link>
    );
  }

  return (
    <Link href={`/works/${project.slug}`} className="group block">
      <MediaThumb
        src={project.thumbnail_url}
        alt={project.title}
        showOverlay
        className="aspect-[4/3]"
      />
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
        {project.title}
      </h3>
      <p className="mt-1 line-clamp-1 text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
        {project.summary}
      </p>
    </Link>
  );
}
