import { AboutSummary } from "@/components/about-summary";
import { CapabilitiesSection } from "@/components/capabilities-section";
import { CurrentlyDoingSection } from "@/components/currently-doing-section";
import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { Hero } from "@/components/hero";
import { StudySection } from "@/components/study-section";
import { WorksSection } from "@/components/works-section";
import {
  getAbout,
  getCareerYears,
  getCategories,
  getCurrentlyDoing,
  getFeaturedProjects,
  getFeaturedStudies,
  getLatestCompanyCareers,
  getPublishedProjectsCount,
  getSiteSettings,
} from "@/lib/data";

export default async function Home() {
  // currently_limit이 site_settings에 있어 먼저 가져온 뒤, 그 값으로 나머지를 병렬 조회한다.
  const settings = await getSiteSettings();

  const [
    professionalProjects,
    sideProjects,
    studies,
    about,
    careers,
    currentlyDoing,
    careerYears,
    projectsCount,
    categories,
  ] = await Promise.all([
    getFeaturedProjects("professional", 5),
    getFeaturedProjects("side", 2),
    getFeaturedStudies(4),
    getAbout(),
    getLatestCompanyCareers(3),
    getCurrentlyDoing(settings?.currently_limit ?? 6),
    getCareerYears(),
    getPublishedProjectsCount(),
    getCategories(),
  ]);
  const professionalOrder = categories.filter((c) => c.scope === "work_professional").map((c) => c.name);
  const studyOrder = categories.filter((c) => c.scope === "study").map((c) => c.name);

  // TEMP: '+N' 배지 예시 확인용 — 확인 끝나면 제거
  const professionalProjectsForDemo = professionalProjects.map((p, i) =>
    i === 0 ? { ...p, result: "성과 요약 1\n성과 요약 2\n성과 요약 3" } : p,
  );

  return (
    <>
      <Gnb />
      <main className="flex-1">
        <Hero
          about={about}
          careerYears={careerYears}
          projectsCount={projectsCount}
          heroTitle={settings?.hero_title ?? "Welcome To My Home"}
          heroMediaType={settings?.hero_media_type ?? "video"}
          heroImageUrl={settings?.hero_image_url ?? null}
          heroVideoUrl={settings?.hero_video_url ?? null}
        />
        <CapabilitiesSection />
        <WorksSection
          theme="dark"
          projects={professionalProjectsForDemo}
          moreHref="/works?tab=professional"
          industryOrder={professionalOrder}
        />
        <StudySection studies={studies} moreHref="/study" categoryOrder={studyOrder} />
        <WorksSection
          theme="light"
          projects={sideProjects}
          moreHref="/works?tab=side"
        />
        <AboutSummary about={about} careers={careers} />
        <CurrentlyDoingSection items={currentlyDoing} />
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
