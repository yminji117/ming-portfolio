import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudyForm } from "@/components/admin/study-form";
import { getKnownStudyCategories } from "@/lib/data";
import type { Study } from "@/lib/types";

export default async function AdminEditStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) console.error("AdminEditStudyPage query failed:", error.message);
  if (!data) notFound();

  const study = data as Study;

  const [{ count }, categoryOptions] = await Promise.all([
    supabase
      .from("studies")
      .select("id", { count: "exact", head: true })
      .eq("is_featured", true)
      .neq("id", id),
    getKnownStudyCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">{study.title}</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">/study/{study.slug}</p>
      </div>
      <StudyForm study={study} featuredCount={count ?? 0} categoryOptions={categoryOptions} />
    </div>
  );
}
