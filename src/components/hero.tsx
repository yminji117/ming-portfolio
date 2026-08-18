"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CopyEmailButton } from "@/components/copy-email-button";
import { getInstagramHandle } from "@/lib/format";
import type { About } from "@/lib/types";

const WORDMARK = "PORTFOLIO";

export function Hero({
  about,
  careerYears,
  projectsCount,
}: {
  about: About | null;
  careerYears: number | null;
  projectsCount: number;
}) {
  const name = about?.name_ko || about?.name_en;

  return (
    <section className="bg-[var(--color-bg)] pb-16 pt-28 lg:pb-24 lg:pt-36">
      <div className="container-app">
        <h1
          className="select-none font-[family-name:var(--font-body)] font-bold leading-none tracking-tight text-[var(--color-accent)]"
          style={{ fontSize: "var(--fs-hero)" }}
        >
          {WORDMARK.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: (i * 0.6) / WORDMARK.length,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ display: "inline-block" }}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* 사진 카드 자체는 모서리를 둥글게 자르되(overflow-hidden), 카드를 감싸는 바깥 래퍼는
            overflow를 열어둔다 — Figma에서 4개 칩이 사진 모서리를 살짝 벗어나 걸쳐 있기 때문 */}
        <div className="relative -mt-10 lg:-mt-16">
          <div className="relative mx-auto w-full max-w-3xl">
            <div className="relative aspect-[767/420] w-full overflow-hidden rounded-[var(--radius)] bg-[var(--color-line)]">
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

            {name && (
              <div className="glass-chip backdrop-blur-xl backdrop-saturate-150 absolute right-4 top-4 w-[160px] lg:right-[-8%] lg:top-[11%]">
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
              <div className="glass-chip backdrop-blur-xl backdrop-saturate-150 relative mt-4 w-[152px] lg:absolute lg:mt-0 lg:left-[-10%] lg:bottom-[21%]">
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
                className="glass-chip backdrop-blur-xl backdrop-saturate-150 relative mt-4 w-[152px] transition-colors duration-[var(--dur-fast)] hover:bg-white/20 lg:absolute lg:mt-0 lg:left-[12%] lg:bottom-[-8%]"
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
              <div className="glass-chip backdrop-blur-xl backdrop-saturate-150 relative mt-4 w-[229px] lg:absolute lg:mt-0 lg:left-[95%] lg:bottom-[-9%]">
                <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">
                  Contact
                </span>
                {about?.email && (
                  <div className="group flex w-full items-center justify-between gap-2">
                    <CopyEmailButton
                      email={about.email}
                      className="text-left text-[length:var(--fs-body)] text-[var(--color-text-muted)] transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--color-accent)]"
                    />
                    <span
                      aria-hidden="true"
                      className="text-[20px] font-extralight text-[var(--color-text-muted)] transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--color-accent)]"
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
                    className="flex w-full items-center justify-between gap-2 text-[length:var(--fs-body)] text-[var(--color-text-muted)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
                  >
                    {getInstagramHandle(about.instagram_url)}
                    <span aria-hidden="true" className="text-[20px] font-extralight">→</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
