import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { StudyListClient } from "@/components/study-list-client";
import { getAbout, getStudiesPage } from "@/lib/data";
import { LIST_PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Study | MINJI",
  description: "MINJI의 스터디/아티클/회고 목록",
};

export default async function StudyPage() {
  const [{ items, total }, about] = await Promise.all([
    getStudiesPage(0, LIST_PAGE_SIZE),
    getAbout(),
  ]);

  return (
    <>
      <Gnb />
      <main className="flex-1 pt-16 lg:pt-[60px]">
        <div className="container-app py-10 lg:py-16">
          <h1
            className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight"
            style={{ fontSize: "var(--fs-display-xl)" }}
          >
            Study
          </h1>

          <div className="mt-8 lg:mt-10">
            <StudyListClient initialItems={items} total={total} />
          </div>
        </div>
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
