import { AboutSummary } from "@/components/about-summary";
import { CurrentlyDoingSection } from "@/components/currently-doing-section";
import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { Hero } from "@/components/hero";
import { StudySection } from "@/components/study-section";
import { WelcomeTicker } from "@/components/welcome-ticker";
import { WorksSection } from "@/components/works-section";
import {
  getAbout,
  getCareerYears,
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
  ] = await Promise.all([
    getFeaturedProjects("professional", 3),
    getFeaturedProjects("side", 4),
    getFeaturedStudies(5),
    getAbout(),
    getLatestCompanyCareers(3),
    getCurrentlyDoing(settings?.currently_limit ?? 6),
    getCareerYears(),
    getPublishedProjectsCount(),
  ]);

  return (
    <>
      <Gnb />
      <main className="flex-1">
        <Hero about={about} careerYears={careerYears} projectsCount={projectsCount} />
        <WelcomeTicker text={settings?.hero_title ?? "Welcome To My Home"} />
        <WorksSection
          theme="dark"
          sub="professional"
          projects={professionalProjects}
          moreHref="/works?tab=professional"
        />
        <StudySection studies={studies} moreHref="/study" />
        <WorksSection
          theme="light"
          sub="side"
          projects={sideProjects}
          moreHref="/works?tab=side"
        />
        <AboutSummary about={about} careers={careers} />
        <CurrentlyDoingSection items={currentlyDoing} />
      </main>
      <Footer
        email={about?.email ?? null}
        instagramUrl={about?.instagram_url ?? null}
      />
    </>
  );
}
