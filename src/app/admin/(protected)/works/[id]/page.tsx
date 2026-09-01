import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/project-form";
import { getKnownIndustries } from "@/lib/data";
import type { Project } from "@/lib/types";

export default async function AdminEditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) console.error("AdminEditWorkPage query failed:", error.message);
  if (!data) notFound();

  const project = data as Project;

  const [{ count: professional }, { count: side }, industryOptions] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category", "professional")
      .eq("is_featured", true)
      .neq("id", id),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category", "side")
      .eq("is_featured", true)
      .neq("id", id),
    getKnownIndustries(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">{project.title}</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">/works/{project.slug}</p>
        <p className="mt-0.5 font-mono text-[12px] text-[var(--color-text-muted)]">ID · {project.id}</p>
      </div>
      <ProjectForm
        key={project.id}
        project={project}
        featuredCounts={{ professional: professional ?? 0, side: side ?? 0 }}
        industryOptions={industryOptions}
      />
    </div>
  );
}
