import { createClient } from "@/lib/supabase/server";
import { StudyForm } from "@/components/admin/study-form";
import { getKnownStudyCategories } from "@/lib/data";

export default async function AdminNewStudyPage() {
  const supabase = await createClient();
  const [{ count }, categoryOptions] = await Promise.all([
    supabase.from("studies").select("id", { count: "exact", head: true }).eq("is_featured", true),
    getKnownStudyCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">새 스터디</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          등록 후에도 계속 수정할 수 있어요. 메인 노출 여부·순서는 이 폼에서 바로 설정하거나, 나중에 노출
          관리에서 바꿀 수 있어요.
        </p>
      </div>
      <StudyForm featuredCount={count ?? 0} categoryOptions={categoryOptions} />
    </div>
  );
}
