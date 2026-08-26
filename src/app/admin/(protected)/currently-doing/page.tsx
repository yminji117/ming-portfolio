import { CurrentlyDoingEditor } from "@/components/admin/currently-doing-editor";
import { getAllCurrentlyDoing, getProjectsForSelect, getStudiesForSelect } from "@/lib/data";

export default async function AdminCurrentlyDoingPage() {
  const [items, projects, studies] = await Promise.all([
    getAllCurrentlyDoing(),
    getProjectsForSelect(),
    getStudiesForSelect(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">Currently Doing</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          라벨·일자를 표에서 바로 수정해요. 라벨/노출/연결은 바로 저장되고, 텍스트·날짜는 입력을 마치고
          다른 곳을 클릭하면 저장돼요.
        </p>
      </div>

      <CurrentlyDoingEditor items={items} projects={projects} studies={studies} />
    </div>
  );
}
