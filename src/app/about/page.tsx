import type { Metadata } from "next";
import Image from "next/image";
import { CopyEmailButton } from "@/components/copy-email-button";
import { CurrentlyDoingSection } from "@/components/currently-doing-section";
import { Footer } from "@/components/footer";
import { FullCareerTimeline } from "@/components/full-career-timeline";
import { Gnb } from "@/components/gnb";
import { SkillsGrid } from "@/components/skills-grid";
import { getInstagramHandle } from "@/lib/format";
import {
  getAbout,
  getAllCareers,
  getCurrentlyDoing,
  getSkills,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "About | MINJI",
  description: "MINJI 소개, 연혁, 스킬",
};

export default async function AboutPage() {
  const [about, careers, skills, currentlyDoing] = await Promise.all([
    getAbout(),
    getAllCareers(),
    getSkills(),
    getCurrentlyDoing(),
  ]);

  const name = about?.name_ko || about?.name_en || "MINJI";

  return (
    <>
      <Gnb />
      <main className="flex-1 pt-16 lg:pt-[60px]">
        <div className="container-app py-10 lg:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
            <div className="w-full max-w-[280px] shrink-0">
              <div className="aspect-[280/350] w-full overflow-hidden rounded-[var(--radius)] bg-[var(--color-bg)]">
                {about?.photo_url ? (
                  <Image
                    src={about.photo_url}
                    alt={name}
                    width={280}
                    height={350}
                    priority
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-4xl font-black text-[var(--color-text-muted)]">
                    MJ
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h1
                  className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight"
                  style={{ fontSize: "var(--fs-display-xl)" }}
                >
                  {name}
                </h1>
                {about?.name_en && about?.name_ko && (
                  <p className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                    {about.name_en}
                  </p>
                )}
                {about?.tagline && (
                  <p className="text-[length:var(--fs-display-md)] font-medium">{about.tagline}</p>
                )}
              </div>

              {(about?.email || about?.instagram_url) && (
                <div className="flex flex-wrap items-center gap-4">
                  {about?.email && (
                    <CopyEmailButton
                      email={about.email}
                      className="inline-flex h-11 items-center rounded-full border border-[var(--color-line)] px-5 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    />
                  )}
                  {about?.instagram_url && (
                    <a
                      href={about.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center rounded-full border border-[var(--color-line)] px-5 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      {getInstagramHandle(about.instagram_url)}
                    </a>
                  )}
                  {about?.resume_url && (
                    <a
                      href={about.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center rounded-full bg-[var(--color-accent)] px-5 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02]"
                    >
                      Resume ↓
                    </a>
                  )}
                </div>
              )}

              <FullCareerTimeline careers={careers} />

              <SkillsGrid skills={skills} />

              {about?.cover_letter && (
                <section className="flex flex-col gap-4">
                  <h2 className="text-[length:var(--fs-eyebrow)] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    Cover Letter
                  </h2>
                  <p className="whitespace-pre-line text-[length:var(--fs-body)] leading-relaxed">
                    {about.cover_letter}
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>

        <CurrentlyDoingSection
          id="currently"
          items={currentlyDoing}
          filterable
          moreHref="/about#currently"
        />
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
