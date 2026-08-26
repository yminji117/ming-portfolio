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

  // TEMP: 더보기 버튼 동작 확인용 — 실 데이터를 복제해 12개로 늘림. 확인 끝나면 이 블록 제거.
  const currentlyDoingForTest = [
    ...currentlyDoing,
    ...currentlyDoing.map((item, i) => ({ ...item, id: `${item.id}-dup${i}` })),
  ].slice(0, 12);

  return (
    <>
      <Gnb />
      <main className="flex-1 pt-16 lg:pt-[60px]">
        <div className="container-app py-10 lg:py-16">
          <div className="mx-auto flex max-w-[480px] flex-col gap-8 lg:max-w-[859px] lg:flex-row lg:items-start lg:gap-10">
            {/* Mobile: 사진 + 이름/직무/연락처 — Figma '(Mo)About | MINJI'(node 288:402) 반영 */}
            <div className="flex items-end gap-5 lg:hidden">
              <div className="h-[224px] w-[179px] shrink-0 overflow-hidden rounded-[var(--radius)] bg-[var(--color-bg)]">
                {about?.photo_url ? (
                  <Image
                    src={about.photo_url}
                    alt={name}
                    width={179}
                    height={224}
                    priority
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-2xl font-black text-[var(--color-text-muted)]">
                    MJ
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start justify-end gap-10">
                <div className="flex w-full min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-end gap-3">
                    <h1 className="text-[28px] font-bold leading-[40px] tracking-[-1px] text-[var(--color-text)]">
                      {name}
                    </h1>
                    {about?.name_en && about?.name_ko && (
                      <p className="text-[14px] leading-6 text-[var(--color-text-muted)]">
                        {about.name_en}
                      </p>
                    )}
                  </div>
                  {about?.tagline && (
                    <p className="text-[20px] font-medium leading-[30px] text-[var(--color-text)]">
                      {about.tagline}
                    </p>
                  )}
                </div>

                {(about?.email || about?.instagram_url) && (
                  <div className="flex w-full min-w-0 flex-col items-start gap-3">
                    {about?.email && (
                      <CopyEmailButton
                        email={about.email}
                        className="block h-9 max-w-full truncate rounded-full border border-[var(--color-line)] px-[17px] text-[16px] leading-9 text-[var(--color-text)]"
                      />
                    )}
                    {about?.instagram_url && (
                      <a
                        href={about.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-9 max-w-full truncate rounded-full border border-[var(--color-line)] px-[17px] text-[16px] leading-9 text-[var(--color-text)]"
                      >
                        {getInstagramHandle(about.instagram_url)}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: 사진 (기존 유지) */}
            <div className="mx-auto hidden w-full max-w-[280px] shrink-0 lg:mx-0 lg:block">
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

            <div className="flex flex-1 flex-col gap-[60px] lg:max-w-[539px]">
              {/* Desktop: 이름/직무/연락처 (기존 유지) */}
              <div className="hidden flex-col gap-3 lg:flex">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-end gap-5">
                    <h1
                      className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight text-[40px]"
                    >
                      {name}
                    </h1>
                    {about?.name_en && about?.name_ko && (
                      <p className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                        {about.name_en}
                      </p>
                    )}
                  </div>
                  {about?.tagline && (
                    <p className="text-[length:var(--fs-display-md)] font-medium">{about.tagline}</p>
                  )}
                </div>

                {(about?.email || about?.instagram_url) && (
                  <div className="flex flex-wrap items-center gap-4">
                    {about?.email && (
                      <CopyEmailButton
                        email={about.email}
                        className="inline-flex h-9 items-center rounded-full border border-[var(--color-line)] px-4 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      />
                    )}
                    {about?.instagram_url && (
                      <a
                        href={about.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center rounded-full border border-[var(--color-line)] px-4 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        {getInstagramHandle(about.instagram_url)}
                      </a>
                    )}
                    {about?.resume_url && (
                      <a
                        href={about.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center rounded-full bg-[var(--color-accent)] px-4 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02]"
                      >
                        Resume ↓
                      </a>
                    )}
                  </div>
                )}
              </div>

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

              <FullCareerTimeline careers={careers} />

              <SkillsGrid skills={skills} />
            </div>
          </div>
        </div>

        <CurrentlyDoingSection
          id="currently"
          items={currentlyDoingForTest}
          filterable
          moreHref="/about#currently"
          showTopBorder={false}
        />
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
