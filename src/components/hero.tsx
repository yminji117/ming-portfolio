"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CopyEmailButton } from "@/components/copy-email-button";
import { getInitials } from "@/lib/format";
import type { About } from "@/lib/types";

const WORDMARK = "PORTFOLIO";

function getInstagramHandle(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\//g, "");
    return path ? `@${path}` : url;
  } catch {
    return url;
  }
}

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
          className="select-none font-[family-name:var(--font-display)] font-black leading-none tracking-tight text-[var(--color-accent)]"
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

        <div className="relative -mt-10 lg:-mt-16">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-[var(--radius)] bg-[var(--color-line)] lg:ml-auto lg:mr-0">
            {about?.photo_url ? (
              <Image
                src={about.photo_url}
                alt={name ?? "MINJI"}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] font-black text-[var(--color-text-muted)]"
                style={{ fontSize: "var(--fs-section)" }}
              >
                {getInitials(name ?? "MINJI")}
              </div>
            )}

            {name && (
              <div className="chip absolute right-4 top-4 max-w-[70%] lg:right-6 lg:top-6">
                <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">
                  {name}
                </span>
                {about?.tagline && (
                  <span className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                    {about.tagline}
                  </span>
                )}
              </div>
            )}
          </div>

          {careerYears !== null && (
            <div className="chip relative mt-4 w-fit lg:absolute lg:bottom-8 lg:left-0 lg:mt-0">
              <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">
                {careerYears}년차
              </span>
              <span className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                현업 경력
              </span>
            </div>
          )}

          {projectsCount > 0 && (
            <div className="chip relative mt-4 w-fit lg:absolute lg:bottom-8 lg:left-[26%] lg:mt-0">
              <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">
                {projectsCount}건 완료
              </span>
              <span className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                완료 프로젝트
              </span>
            </div>
          )}

          {(about?.email || about?.instagram_url) && (
            <div className="chip relative mt-4 w-fit lg:absolute lg:bottom-8 lg:right-0 lg:mt-0">
              <span className="text-[length:var(--fs-caption)] font-bold text-[var(--color-text)]">
                Contact
              </span>
              {about?.email && (
                <CopyEmailButton
                  email={about.email}
                  className="flex items-center gap-2 text-left text-[length:var(--fs-caption)] text-[var(--color-text-muted)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
                />
              )}
              {about?.instagram_url && (
                <a
                  href={about.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[length:var(--fs-caption)] text-[var(--color-text-muted)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
                >
                  {getInstagramHandle(about.instagram_url)}
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
