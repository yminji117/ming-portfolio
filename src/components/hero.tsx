import Link from "next/link";
import { CopyEmailButton } from "@/components/copy-email-button";
import { HeroMedia } from "@/components/hero-media";
import { MobileHero } from "@/components/mobile-hero";
import { TrackedExternalLink } from "@/components/tracked-external-link";
import { getInstagramHandle } from "@/lib/format";
import type { About, HeroMediaType } from "@/lib/types";

const bigWordClass =
  "font-[family-name:var(--font-display)] font-black text-[40px] leading-[1.055] tracking-[-0.021em]";

// "Welcome"만 반응형 — To/My/Home은 MobileHero의 실측 위치 계산이 40px 고정을 전제로 하므로 그대로 둔다.
const welcomeWordClass =
  "font-[family-name:var(--font-display)] font-black leading-[1.055] tracking-[-0.021em]";

export function Hero({
  about,
  careerYears,
  projectsCount,
  heroTitle,
  heroMediaType,
  heroImageUrl,
  heroVideoUrl,
}: {
  about: About | null;
  careerYears: number | null;
  projectsCount: number;
  heroTitle: string;
  heroMediaType: HeroMediaType;
  heroImageUrl: string | null;
  heroVideoUrl: string | null;
}) {
  const name = about?.name_ko || about?.name_en;
  const words = heroTitle.split(" ");
  const hasFourWords = words.length === 4;

  return (
    <section className="relative overflow-hidden bg-[var(--color-bg)] pb-16 pt-[88px] lg:aspect-[1512/760] lg:p-0">
      {hasFourWords && (
        <div className="pointer-events-none absolute inset-0 z-0 hidden select-none lg:block">
          <span
            className="absolute font-[family-name:var(--font-body)] font-bold leading-none tracking-tight text-[var(--color-accent)] left-[6.35%] top-[14.34%]"
            style={{ fontSize: "clamp(39px, 7.94vw, 120px)" }}
          >
            {words[0]}
          </span>
          <span
            className="absolute font-[family-name:var(--font-body)] font-bold leading-none tracking-tight text-[var(--color-ink)] left-[84.46%] top-[16.71%]"
            style={{ fontSize: "clamp(39px, 7.94vw, 120px)" }}
          >
            {words[1]}
          </span>
          <span
            className="absolute font-[family-name:var(--font-body)] font-bold leading-none tracking-tight text-[var(--color-ink)] left-[12.3%] top-[63.29%]"
            style={{ fontSize: "clamp(39px, 7.94vw, 120px)" }}
          >
            {words[2]}
          </span>
          <span
            className="absolute font-[family-name:var(--font-body)] font-bold leading-none tracking-tight text-[var(--color-ink)] left-[57.94%] top-[77.37%]"
            style={{ fontSize: "clamp(39px, 7.94vw, 120px)" }}
          >
            {words[3]}
          </span>
        </div>
      )}

      {/* 모바일 — Figma '[Mo] MINJI_375'/'[Mo] MINJI_414'(154:626/155:1784) 참고.
          다른 섹션과 동일하게 반응형(화면 폭에 맞춰 채움)으로 적용 — 사진/칩 뒤에
          비치는 텍스트 간격은 MobileHero의 실측 로직이 크기 변화에 맞춰 유지해준다. */}
      <div className="lg:hidden">
        {hasFourWords ? (
          <>
            <p
              className={`${welcomeWordClass} pl-6 text-[var(--color-accent)]`}
              style={{ fontSize: "clamp(32px, 10.67vw, 56px)" }}
            >
              {words[0]}
            </p>
            <MobileHero
              about={about}
              careerYears={careerYears}
              projectsCount={projectsCount}
              words={words}
              heroMediaType={heroMediaType}
              heroImageUrl={heroImageUrl}
              heroVideoUrl={heroVideoUrl}
            />
          </>
        ) : (
          <h1
            className="font-[family-name:var(--font-body)] font-bold leading-tight tracking-tight text-[var(--color-accent)]"
            style={{ fontSize: "clamp(32px, 9vw, 64px)" }}
          >
            {heroTitle}
          </h1>
        )}
      </div>

      {/* 데스크톱 — 사진 카드와 4개 칩을 Figma 좌표 기준 절대 배치 */}
      <div className="relative z-10 hidden lg:absolute lg:inset-0 lg:block">
        <div className="relative mx-auto w-full max-w-3xl lg:absolute lg:left-[24.67%] lg:top-[27.24%] lg:mx-0 lg:h-[55.26%] lg:w-[50.73%] lg:max-w-none">
          <div className="relative aspect-[767/420] w-full overflow-hidden rounded-[var(--radius)] bg-[var(--color-line)] lg:aspect-auto lg:h-full">
            <HeroMedia
              mediaType={heroMediaType}
              imageUrl={heroImageUrl}
              videoUrl={heroVideoUrl}
              posterUrl={about?.photo_url ?? undefined}
              sizes="(min-width: 1024px) 51vw, 100vw"
            />
          </div>

          {name && (
            <div className="glass-chip backdrop-blur-xl backdrop-saturate-150 absolute right-[-12.91%] top-[10.71%] w-[160px] animate-[float_6s_ease-in-out_infinite]">
              <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">
                {name}
              </span>
              {about?.tagline && (
                <span className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                  {about.tagline}
                </span>
              )}
            </div>
          )}

          {careerYears !== null && (
            <div className="glass-chip backdrop-blur-xl backdrop-saturate-150 absolute left-[-10%] bottom-[21%] w-[152px] animate-[float_8s_ease-in-out_1.2s_infinite]">
              <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">
                {careerYears}년차
              </span>
              <span className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                현업 경력
              </span>
            </div>
          )}

          {projectsCount > 0 && (
            <Link
              href="/works"
              className="glass-chip backdrop-blur-xl backdrop-saturate-150 absolute left-[12%] bottom-[-8%] w-[152px] transition-colors duration-[var(--dur-fast)] hover:bg-white/20 animate-[float_6s_ease-in-out_infinite]"
            >
              <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">
                {projectsCount}건 완료
              </span>
              <span className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                완료 프로젝트
              </span>
            </Link>
          )}

          {(about?.email || about?.instagram_url) && (
            <div className="glass-chip backdrop-blur-xl backdrop-saturate-150 absolute left-[88.27%] bottom-[-5.71%] w-[229px] animate-[float_8s_ease-in-out_1.2s_infinite]">
              <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">
                Contact
              </span>
              {about?.email && (
                <div className="group flex w-full items-center justify-between gap-2">
                  <CopyEmailButton
                    email={about.email}
                    className="text-left text-[length:var(--fs-body)] text-[#0A0A0A] transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--color-accent)]"
                  />
                  <span
                    aria-hidden="true"
                    className="text-[20px] font-extralight text-[#0A0A0A] transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--color-accent)]"
                  >
                    →
                  </span>
                </div>
              )}
              {about?.instagram_url && (
                <TrackedExternalLink
                  href={about.instagram_url}
                  eventName="instagram_click"
                  className="flex w-full items-center justify-between gap-2 text-[length:var(--fs-body)] text-[#0A0A0A] transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
                >
                  {getInstagramHandle(about.instagram_url)}
                  <span aria-hidden="true" className="text-[20px] font-extralight">→</span>
                </TrackedExternalLink>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
