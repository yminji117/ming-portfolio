import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { NotFoundContent } from "@/components/not-found-content";
import { getAbout } from "@/lib/data";

export default async function ProjectNotFound() {
  const about = await getAbout();

  return (
    <>
      <Gnb />
      <main className="flex-1 pt-16 lg:pt-[60px]">
        <NotFoundContent
          title="존재하지 않는 프로젝트예요"
          description="삭제되었거나 아직 공개되지 않은 프로젝트예요."
          ctaHref="/works"
          ctaLabel="Work 목록으로"
        />
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
