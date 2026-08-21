"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons";

const MOBILE_PREVIEW_COUNT = 3;

// 화살표는 항상 DOM에 두고 opacity만 트랜지션한다 — 조건부 렌더(마운트/언마운트)로 하면
// 트랙 폭이 갑자기 바뀌면서 이미지가 같이 밀리는 느낌이 나서, 자연스러운 페이드가 안 된다.
const arrowButtonClass =
  "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--color-text)] backdrop-blur-xl backdrop-saturate-150 transition-[opacity,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-white/20";

// Works/Study 상세 페이지 IMAGE 섹션.
// - Mobile(lg 미만, Figma '최종' 모바일 상세 반영): 세로로 이미지를 나열하되 기본은 3장만 보여주고,
//   아래쪽 화살표를 누르면 전체가 펼쳐지며 화살표가 위쪽을 가리키도록 뒤집힌다(다시 누르면 3장으로 접힘).
//   Works/Study 둘 다 동일.
// - Desktop(lg 이상): desktopLayout으로 분기.
//   "carousel"(Works 기본) — 가로 캐러셀 + 좌우 화살표(스와이프도 가능), 더 넘길 방향에 이미지가 있을 때만 페이드인/아웃.
//   "stack"(Study, Figma 시안 반영) — 전체 이미지를 화살표 없이 세로로 그대로 나열.
export function ProjectGallery({
  urls,
  desktopLayout = "carousel",
}: {
  urls: string[];
  desktopLayout?: "carousel" | "stack";
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

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
  }, [urls]);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: track.clientWidth * 0.8 * direction, behavior: "smooth" });
  }

  const hasMoreThanPreview = urls.length > MOBILE_PREVIEW_COUNT;
  const mobileVisibleUrls = expanded ? urls : urls.slice(0, MOBILE_PREVIEW_COUNT);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[length:var(--fs-eyebrow)] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        Image
      </h2>

      {/* Mobile — 기본 3장만 노출, 화살표로 펼치기/접기 */}
      <div className="flex flex-col items-center gap-3 lg:hidden">
        <div className="flex w-full flex-col gap-3">
          {mobileVisibleUrls.map((url, i) => (
            <div
              key={i}
              className="relative aspect-[351/197] w-full overflow-hidden rounded-[4px] bg-[var(--color-line)]"
            >
              <Image src={url} alt="" fill sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
        {hasMoreThanPreview && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "이미지 접기" : "이미지 전체 보기"}
            aria-expanded={expanded}
            className={`${arrowButtonClass} -mt-5 opacity-100`}
          >
            <ArrowRightIcon
              className={`size-6 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] ${
                expanded ? "-rotate-90" : "rotate-90"
              }`}
            />
          </button>
        )}
      </div>

      {/* Desktop */}
      {desktopLayout === "stack" ? (
        <div className="hidden flex-col gap-3 lg:flex">
          {urls.map((url, i) => (
            <div
              key={i}
              className="relative aspect-[351/197] w-full overflow-hidden rounded-[4px] bg-[var(--color-line)]"
            >
              <Image src={url} alt="" fill sizes="70vw" className="object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="hidden items-center lg:flex">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="이전 이미지"
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
            className="no-scrollbar flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth"
          >
            {urls.map((url, i) => (
              <div
                key={i}
                className="relative aspect-[351/197] w-[calc((100%-36px)/3.5)] shrink-0 snap-start overflow-hidden rounded-[4px] bg-[var(--color-line)]"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="30vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="다음 이미지"
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
    </section>
  );
}
