import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/project-form";

export default async function AdminNewWorkPage() {
  const supabase = await createClient();
  const [{ count: professional }, { count: side }] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category", "professional")
      .eq("is_featured", true),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category", "side")
      .eq("is_featured", true),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">새 프로젝트</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          등록 후에도 계속 수정할 수 있어요. 메인 노출 여부·순서는 이 폼에서 바로 설정하거나, 나중에 노출
          관리에서 바꿀 수 있어요.
        </p>
      </div>
      <ProjectForm featuredCounts={{ professional: professional ?? 0, side: side ?? 0 }} />
    </div>
  );
}
