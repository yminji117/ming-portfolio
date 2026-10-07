"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { MediaThumb } from "@/components/media-thumb";
import { Reveal } from "@/components/reveal";
import { Tag } from "@/components/tag";
import { formatProjectRange, normalizeIndustry, sortIndustries } from "@/lib/format";
import type { Project } from "@/lib/types";

// project-gallery.tsx의 글라스 화살표 버튼과 동일한 스타일(Figma 'MINJI_최종(1)' Side 캐러셀 참고).
const arrowButtonClass =
  "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-[#EBEEF5] bg-white/10 text-[var(--color-text)] backdrop-blur-[20px] backdrop-saturate-150 transition-[opacity,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-white/20";

export function WorksSideGrid({
  projects,
  industryOrder = [],
}: {
  projects: Project[];
  industryOrder?: string[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const showCarousel = projects.length >= 3;

  useEffect(() => {
    const track = trackRef.current;
    if (!showCarousel || !track) return;

    function updateScrollState() {
      if (!track) return;
      setCanScrollPrev(track.scrollLeft > 1);
      setCanScrollNext(track.scrollWidth - track.clientWidth - track.scrollLeft > 1);
    }

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(track);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [showCarousel, projects.length]);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: track.clientWidth * 0.8 * direction, behavior: "smooth" });
  }

  const renderCard = (project: Project, i: number) => {
    const [category] = sortIndustries(normalizeIndustry(project.industry), industryOrder);
    const period = formatProjectRange(project.start_date, project.end_date);

    return (
      <Reveal key={project.id} index={i}>
        <Link href={`/works/${project.slug}`} className="group block">
          <MediaThumb
            src={project.thumbnail_url}
            alt={project.title}
            className="aspect-[650/453] border border-solid border-[#EBEEF5]"
          />
          <div className="mt-[10px] flex flex-col gap-2 border-t border-black pt-[18px]">
            <div className="flex flex-wrap items-center gap-2">
              {category && <Tag>{category}</Tag>}
              <h3 className="text-2xl">{project.title}</h3>
            </div>
            <p className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
              {project.summary}
            </p>
            {period && <p className="text-[14px] text-[var(--color-text-muted)]">{period}</p>}
          </div>
        </Link>
      </Reveal>
    );
  };

  return (
    <>
      <div
        className={`mt-8 grid grid-cols-1 gap-10 lg:mt-12 ${
          showCarousel ? "lg:hidden" : "lg:grid-cols-2 lg:gap-5"
        }`}
      >
        {projects.map(renderCard)}
      </div>
      {showCarousel && (
        <div className="mt-8 hidden items-center lg:mt-12 lg:flex">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="이전 프로젝트"
            aria-hidden={!canScrollPrev}
            tabIndex={canScrollPrev ? 0 : -1}
            className={`${arrowButtonClass} -mr-6 ${
              canScrollPrev ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <ArrowRightIcon className="size-6 rotate-180" />
          </button>
          <div
            ref={trackRef}
            className="no-scrollbar flex flex-1 snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth"
          >
            {projects.map((project, i) => (
              <div key={project.id} className="w-[calc((100%-40px)/2.5)] shrink-0 snap-start">
                {renderCard(project, i)}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="다음 프로젝트"
            aria-hidden={!canScrollNext}
            tabIndex={canScrollNext ? 0 : -1}
            className={`${arrowButtonClass} -ml-6 ${
              canScrollNext ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <ArrowRightIcon className="size-6" />
          </button>
        </div>
      )}
    </>
  );
}
