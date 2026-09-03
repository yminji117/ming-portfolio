import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { WorksListClient } from "@/components/works-list-client";
import { getAbout, getCategories, getProjectCategoryCounts, getProjectsPage } from "@/lib/data";
import { LIST_PAGE_SIZE } from "@/lib/constants";
import type { ProjectCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Work | MINJI",
  description: "MINJI의 Professional/Side 프로젝트 목록",
};

const TABS: { key: ProjectCategory; label: string }[] = [
  { key: "professional", label: "Professional" },
  { key: "side", label: "Side" },
];

export default async function WorksPage(props: PageProps<"/works">) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab === "side" ? "side" : "professional";

  const [{ items, total }, counts, about, allCategories] = await Promise.all([
    getProjectsPage(tab, 0, LIST_PAGE_SIZE),
    getProjectCategoryCounts(),
    getAbout(),
    getCategories(),
  ]);
  const scope = tab === "professional" ? "work_professional" : "work_side";
  const industryOrder = allCategories.filter((c) => c.scope === scope).map((c) => c.name);

  return (
    <>
      <Gnb />
      <main className="flex-1 pt-16 lg:pt-[60px]">
        <div className="container-app py-10 lg:py-16">
          <h1
            className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight"
            style={{ fontSize: "var(--fs-display-xl)" }}
          >
            Work
          </h1>

          <div className="mt-10 flex gap-6 border-b border-[var(--color-line)]">
            {TABS.map(({ key, label }) => (
              <Link
                key={key}
                href={key === "professional" ? "/works" : "/works?tab=side"}
                className={`pb-3 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] ${
                  tab === key
                    ? "border-b-2 border-[var(--color-accent)] font-semibold text-[var(--color-accent)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {label} ({counts[key]})
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <WorksListClient
              key={tab}
              category={tab}
              initialItems={items}
              total={total}
              industryOrder={industryOrder}
            />
          </div>
        </div>
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
