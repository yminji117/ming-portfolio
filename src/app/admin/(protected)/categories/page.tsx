import { CategoryManagerEditor } from "@/components/admin/category-manager-editor";
import { getCategories } from "@/lib/data";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">카테고리 관리</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          Work 업종과 Study 카테고리를 여기서 추가·이름 변경·삭제·순서 변경해요. 이름을 바꾸면 기존
          프로젝트/스터디에 저장된 값도 함께 바뀌어요. 사용 중인 카테고리는 삭제할 수 없어요.
        </p>
      </div>

      <CategoryManagerEditor
        scope="work_professional"
        title="Work · Professional"
        items={categories.filter((c) => c.scope === "work_professional")}
      />
      <CategoryManagerEditor
        scope="work_side"
        title="Work · Side"
        items={categories.filter((c) => c.scope === "work_side")}
      />
      <CategoryManagerEditor
        scope="study"
        title="Study"
        items={categories.filter((c) => c.scope === "study")}
      />
    </div>
  );
}
