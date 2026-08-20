"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { CopyEmailButton } from "@/components/copy-email-button";
import { getInstagramHandle } from "@/lib/format";
import type { About } from "@/lib/types";

const bigWordClass =
  "font-[family-name:var(--font-display)] font-black text-[40px] leading-[1.055] tracking-[-0.021em]";

// 실측 전 첫 페인트(서버 렌더)에 쓰는 근사값 — useLayoutEffect가 페인트 전에
// 실제 값으로 덮어써서 화면상 깜빡임 없이 교체된다.
const FALLBACK_TOPS = { to: 195, my: 286, home: 374 };

export function MobileHero({
  about,
  careerYears,
  projectsCount,
  words,
}: {
  about: About | null;
  careerYears: number | null;
  projectsCount: number;
  words: string[];
}) {
  const name = about?.name_ko || about?.name_en;

  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const nameChipRef = useRef<HTMLDivElement>(null);
  const projectsChipRef = useRef<HTMLAnchorElement>(null);
  const [tops, setTops] = useState(FALLBACK_TOPS);

  useLayoutEffect(() => {
    function measure() {
      const wrap = wrapRef.current;
      const video = videoRef.current;
      if (!wrap || !video) return;
      const wrapTop = wrap.getBoundingClientRect().top;

      // "To"는 동영상 하단과 -2px, "My"는 윤민지 박스 하단과 -9px,
      // "Home"은 완료 프로젝트 박스 하단과 -11px 겹치도록 실측 위치 기준으로 계산한다 —
      // 동영상/칩 크기가 나중에 바뀌어도 이 간격들이 항상 유지된다.
      const to = video.getBoundingClientRect().bottom - wrapTop - 2;
      const nameChip = nameChipRef.current;
      const my = nameChip ? nameChip.getBoundingClientRect().bottom - wrapTop - 9 : to;
      const projectsChip = projectsChipRef.current;
      const home = projectsChip
        ? projectsChip.getBoundingClientRect().bottom - wrapTop - 11
        : my;

      setTops({ to, my, home });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [about, careerYears, projectsCount, words]);

  return (
    <div ref={wrapRef} className="relative -mt-[10px] px-6">
      <p
        aria-hidden="true"
        style={{ top: tops.to }}
        className={`${bigWordClass} pointer-events-none absolute left-0 w-full px-6 text-right text-[var(--color-ink)]`}
      >
        {words[1]}
      </p>
      <p
        aria-hidden="true"
        style={{ top: tops.my }}
        className={`${bigWordClass} pointer-events-none absolute left-0 w-full px-6 text-[var(--color-ink)]`}
      >
        {words[2]}
      </p>
      <p
        aria-hidden="true"
        style={{ top: tops.home }}
        className={`${bigWordClass} pointer-events-none absolute left-0 w-full px-6 text-right text-[var(--color-ink)]`}
      >
        {words[3]}
      </p>

      <div
        ref={videoRef}
        className="relative z-10 aspect-[767/420] w-full overflow-hidden rounded-[var(--radius)] bg-[var(--color-line)]"
      >
        <video
          src="/hero/hi.mp4"
          poster={about?.photo_url ?? undefined}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="relative z-10 mt-5 flex flex-col gap-3">
        {name && (
          <div ref={nameChipRef} className="glass-chip backdrop-blur-xl backdrop-saturate-150 w-full">
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

        {(careerYears !== null || projectsCount > 0) && (
          <div className="flex gap-3">
            {careerYears !== null && (
              <div className="glass-chip backdrop-blur-xl backdrop-saturate-150 w-full flex-1">
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
                ref={projectsChipRef}
                href="/works"
                className="glass-chip backdrop-blur-xl backdrop-saturate-150 w-full flex-1 transition-colors duration-[var(--dur-fast)] hover:bg-white/20"
              >
                <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">
                  {projectsCount}건 완료
                </span>
                <span className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
                  완료 프로젝트
                </span>
              </Link>
            )}
          </div>
        )}

        {(about?.email || about?.instagram_url) && (
          <div className="glass-chip backdrop-blur-xl backdrop-saturate-150 w-full animate-[float_8s_ease-in-out_1.2s_infinite]">
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
              <a
                href={about.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between gap-2 text-[length:var(--fs-body)] text-[#0A0A0A] transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
              >
                {getInstagramHandle(about.instagram_url)}
                <span aria-hidden="true" className="text-[20px] font-extralight">→</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
