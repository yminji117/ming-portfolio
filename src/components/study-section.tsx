"use client";

import Link from "next/link";
import { useState } from "react";
import { MediaThumb } from "@/components/media-thumb";
import { MoreLink } from "@/components/more-link";
import { Reveal } from "@/components/reveal";
import type { Study } from "@/lib/types";

export function StudySection({
  studies,
  moreHref,
}: {
  studies: Study[];
  moreHref: string;
}) {
  const [openId, setOpenId] = useState<string | null>(studies[0]?.id ?? null);

  if (studies.length === 0) return null;

  return (
    <section className="section">
      <div className="container-app">
        <Reveal>
          <div className="flex items-start justify-between gap-6">
            <h2 className="section-heading">Study</h2>
            <MoreLink href={moreHref} variant="icon" />
          </div>
        </Reveal>

        <div className="mt-12 border-t border-[var(--color-line)]">
          {studies.map((study, i) => (
            <Reveal key={study.id} index={i}>
              <StudyAccordionRow
                study={study}
                index={i}
                open={openId === study.id}
                onToggle={() =>
                  setOpenId((current) => (current === study.id ? null : study.id))
                }
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudyAccordionRow({
  study,
  index,
  open,
  onToggle,
}: {
  study: Study;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const isExternal = Boolean(study.external_url);
  const href = study.external_url ?? `/study/${study.slug}`;
  const number = String(index + 1).padStart(2, "0");

  return (
    <div className="border-b border-[var(--color-line)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-4 px-2 py-5 text-left transition-colors duration-[var(--dur-fast)] ${
          open ? "bg-[var(--color-study)] text-[var(--color-ink)]" : "hover:text-[var(--color-accent)]"
        }`}
      >
        <span className="flex items-center gap-4">
          <span className={`text-[length:var(--fs-body)] ${open ? "text-[var(--color-ink)]/70" : "text-[var(--color-text-muted)]"}`}>
            {number}
          </span>
          <span className="text-[length:var(--fs-body)] font-bold tracking-tight">
            {study.title}
          </span>
        </span>
        <span
          className={`text-2xl font-light transition-transform duration-[var(--dur-fast)] ${open ? "rotate-45" : ""}`}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-6 bg-[var(--color-study)] px-2 pb-8 text-[var(--color-ink)] lg:grid-cols-2 lg:items-center lg:gap-10">
          <div>
            <span className="font-[family-name:var(--font-display)] text-7xl font-black leading-none lg:text-8xl">
              {number}
            </span>
            {study.summary && (
              <p className="mt-4 max-w-sm text-[length:var(--fs-body)]">{study.summary}</p>
            )}
            {study.tags.length > 0 && (
              <p className="mt-4 text-[length:var(--fs-caption)] font-semibold uppercase tracking-wide">
                {study.tags.join(" / ")}
              </p>
            )}
            <Link
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="mt-6 inline-flex items-center gap-1 text-[length:var(--fs-body)] font-semibold underline underline-offset-4"
            >
              자세히 보기 {isExternal && "↗"}
            </Link>
          </div>
          <MediaThumb
            src={study.thumbnail_url}
            alt={study.title}
            className="aspect-[16/10]"
          />
        </div>
      )}
    </div>
  );
}
