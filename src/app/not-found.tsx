import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { NotFoundContent } from "@/components/not-found-content";
import { getAbout } from "@/lib/data";

// PRD 12.3 — 등록되지 않은 경로 전체에 대한 공통 404
export default async function RootNotFound() {
  const about = await getAbout();

  return (
    <>
      <Gnb />
      <main className="flex-1 pt-16 lg:pt-[60px]">
        <NotFoundContent ctaHref="/" ctaLabel="홈으로" />
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
