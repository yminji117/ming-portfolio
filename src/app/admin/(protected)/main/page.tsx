import { createClient } from "@/lib/supabase/server";
import { FeaturedManager, type FeaturedManagerItem } from "@/components/admin/featured-manager";
import { FEATURED_CAP_PROFESSIONAL, FEATURED_CAP_SIDE, FEATURED_CAP_STUDY } from "@/lib/featured-caps";

type ProjectRow = FeaturedManagerItem & { category: "professional" | "side" };

export default async function AdminMainPage() {
  const supabase = await createClient();

  const [{ data: projectsData, error: projectsError }, { data: studiesData, error: studiesError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, title, category, is_featured, featured_order")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("title", { ascending: true }),
      supabase
        .from("studies")
        .select("id, title, is_featured, featured_order")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("title", { ascending: true }),
    ]);

  if (projectsError) console.error("AdminMainPage projects query failed:", projectsError.message);
  if (studiesError) console.error("AdminMainPage studies query failed:", studiesError.message);

  const projects = (projectsData as ProjectRow[] | null) ?? [];
  const professional = projects.filter((p) => p.category === "professional");
  const side = projects.filter((p) => p.category === "side");
  const studies = (studiesData as FeaturedManagerItem[] | null) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">메인 노출 관리</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          홈 화면에 노출되는 프로젝트/스터디와 순서를 정해요. published 상태만 노출할 수 있어요.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-bold text-[var(--color-text)]">
          Works · Professional{" "}
          <span className="font-normal text-[var(--color-text-muted)]">(최대 {FEATURED_CAP_PROFESSIONAL})</span>
        </h2>
        <FeaturedManager table="projects" cap={FEATURED_CAP_PROFESSIONAL} items={professional} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-bold text-[var(--color-text)]">
          Works · Side <span className="font-normal text-[var(--color-text-muted)]">(최대 {FEATURED_CAP_SIDE})</span>
        </h2>
        <FeaturedManager table="projects" cap={FEATURED_CAP_SIDE} items={side} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-bold text-[var(--color-text)]">
          Study <span className="font-normal text-[var(--color-text-muted)]">(최대 {FEATURED_CAP_STUDY})</span>
        </h2>
        <FeaturedManager table="studies" cap={FEATURED_CAP_STUDY} items={studies} />
      </section>
    </div>
  );
}
