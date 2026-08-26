import { AboutInfoForm } from "@/components/admin/about-info-form";
import { CareerListEditor } from "@/components/admin/career-list-editor";
import { SkillListEditor } from "@/components/admin/skill-list-editor";
import { getAbout, getAllCareers, getSkills } from "@/lib/data";

export default async function AdminAboutPage() {
  const [about, careers, skills] = await Promise.all([getAbout(), getAllCareers(), getSkills()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">About</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          자기소개, 연혁, 스킬을 관리해요. 각 영역은 개별적으로 저장돼요.
        </p>
      </div>

      <AboutInfoForm about={about} />
      <CareerListEditor careers={careers} />
      <SkillListEditor skills={skills} />
    </div>
  );
}
