"use client";

import { useState } from "react";
import Link from "next/link";
import { ExpandCircleRightIcon, StepCheckIcon } from "@/components/icons";
import { MediaThumb } from "@/components/media-thumb";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Tag } from "@/components/tag";
import { getStudyCategoryLabel, sortStudyTagsForDisplay } from "@/lib/format";
import { getStudyHref } from "@/lib/study";
import type { Study, StudyRoadmapStep } from "@/lib/types";

// 로드맵 본문이 없는 항목을 선택해 펼쳤을 때 보여줄 임시 텍스트.
const PLACEHOLDER_STEPS: StudyRoadmapStep[] = [
  { label: "1단계", text: "주제 정하고 자료 모으기" },
  { label: "2단계", text: "레퍼런스 비교하며 정리하기" },
  { label: "3단계", text: "핵심 인사이트 뽑아내기" },
  { label: "4단계", text: "실제 작업에 적용해보기" },
  { label: "5단계", text: "회고하고 다음 액션 정하기" },
];

export function StudySection({
  studies,
  moreHref,
}: {
  studies: Study[];
  moreHref: string;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  if (studies.length === 0) return null;

  return (
    <section className="border-t border-[var(--color-line)] pt-16 pb-12 lg:pt-[160px] lg:pb-[80px]">
      <div className="container-app">
        <SectionHeading title="Study" moreHref={moreHref} theme="light" />

        <div className="mt-12 border-t border-black">
          {studies.map((study, i) => (
            <Reveal key={study.id} index={i}>
              <StudyItem study={study} isOpen={i === openIndex} onSelect={() => setOpenIndex(i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// 펼침/접힘은 전부 순수 CSS 트랜지션(grid-template-rows/columns 0↔1fr)으로만 처리한다.
// framer-motion의 layout(FLIP) 애니메이션을 같이 쓰면, 위아래 다른 항목이 리플로우되는
// 타이밍과 이 CSS 트랜지션의 타이밍이 서로 다른 엔진(JS FLIP vs 네이티브 CSS)이라
// 어긋나면서 접힐 때 끝부분이 뚝 끊겨 보인다 — 그래서 여기서는 CSS 트랜지션 하나로 통일한다.
function StudyItem({
  study,
  isOpen,
  onSelect,
}: {
  study: Study;
  isOpen: boolean;
  onSelect: () => void;
}) {
  const steps =
    study.body?.steps && study.body.steps.length > 0
      ? study.body.steps
      : PLACEHOLDER_STEPS;
  const { href, isExternal } = getStudyHref(study);
  const rawTag = sortStudyTagsForDisplay(study.tags)[0];
  const tag = rawTag ? getStudyCategoryLabel(rawTag) : undefined;

  // 모바일(태그+펼치기 버튼 한 줄)과 데스크탑(태그+타이틀 한 줄) 둘 다에서 재사용.
  const tagElement = tag ? (
    isOpen ? (
      <span className="inline-flex items-center rounded-full border border-white px-[17px] py-[7px] text-[length:var(--fs-body)] text-white lg:py-[5px]">
        {tag}
      </span>
    ) : (
      <Tag>{tag}</Tag>
    )
  ) : null;

  return (
    <div
      className={`border-y border-black px-4 py-6 transition-colors duration-500 ease-[var(--ease-out)] lg:px-5 lg:py-[28px] ${
        isOpen ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-text)]"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Figma 모바일 시안: 펼치기 링크가 태그와 같은 줄에 있어 <button> 안에 <a>를 중첩할 수 없다 —
            네이티브 button 대신 role="button" div + 키보드 핸들러로 토글 접근성을 유지한다. */}
        <div
          role="button"
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect();
            }
          }}
          aria-expanded={isOpen}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          {/* 모바일: 태그 + 펼치기 버튼 한 줄, 타이틀은 아래 줄 */}
          <div className="flex items-center justify-between gap-4 lg:hidden">
            {tagElement}
            <Link
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              aria-label={`${study.title} 자세히 보기`}
              onClick={(event) => event.stopPropagation()}
              className="group block shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:translate-x-0.5"
            >
              <ExpandCircleRightIcon className="size-12 shrink-0" />
            </Link>
          </div>
          <span className="mt-2 block font-[family-name:var(--font-body)] text-[24px] font-bold tracking-[-0.7px] lg:hidden">
            {study.title}
          </span>

          {/* 데스크탑: 태그 + 타이틀 한 줄 (기존 레이아웃 그대로) */}
          <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-4">
            {tagElement}
            <span className="font-[family-name:var(--font-body)] text-[28px] font-bold tracking-tight">
              {study.title}
            </span>
          </div>

          <div
            className="grid min-h-0 transition-[grid-template-rows] duration-[600ms] ease-[var(--ease-out)]"
            style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
          >
            <div className="min-h-0 overflow-hidden">
              {/* 모바일 전용 썸네일 — 타이틀과 로드맵 사이 (Figma 모바일 시안) */}
              <div className="mt-5 lg:hidden">
                <div className="aspect-[295/162] w-full overflow-hidden rounded-[10px]">
                  <MediaThumb
                    src={study.main_thumbnail_url ?? study.thumbnail_url}
                    alt={study.title}
                    bare
                    theme="dark"
                    className={`h-full w-full transition-opacity duration-500 ${isOpen ? "opacity-100 delay-150" : "opacity-0"}`}
                  />
                </div>
              </div>
              <ol
                className={`relative mt-5 flex flex-col gap-3 pl-3 transition-opacity duration-500 lg:mt-4 lg:gap-2 ${
                  isOpen ? "opacity-100 delay-150" : "opacity-0"
                }`}
                aria-hidden={!isOpen}
              >
                {steps.map((step, i) => (
                  <li
                    key={step.label}
                    className="relative flex flex-col gap-2 pl-9 text-[16px] lg:flex-row lg:flex-wrap lg:items-center lg:gap-2 lg:text-[20px]"
                  >
                    {i < steps.length - 1 && (
                      <span className="absolute left-[11px] top-6 h-full w-px bg-white/40" aria-hidden="true" />
                    )}
                    <StepCheckIcon className="absolute left-0 top-0.5 size-6 shrink-0" />
                    <span className="w-[58px] font-medium text-white">{step.label}</span>
                    <span className="text-[#cecece]">{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* 데스크탑 전용 썸네일 (기존 유지) */}
        <div
          className={`hidden overflow-hidden transition-[max-width] duration-[600ms] ease-[var(--ease-out)] lg:block lg:shrink-0 ${
            isOpen ? "self-stretch" : "self-start"
          }`}
          style={{ maxWidth: isOpen ? "374px" : "0px", maxHeight: isOpen ? "none" : "0px" }}
        >
          <div className="h-full w-[374px] overflow-hidden">
            <MediaThumb
              src={study.main_thumbnail_url ?? study.thumbnail_url}
              alt={study.title}
              bare
              theme="dark"
              className={`h-full transition-opacity duration-500 ${isOpen ? "opacity-100 delay-150" : "opacity-0"}`}
            />
          </div>
        </div>

        {/* 데스크탑 전용 펼치기 링크 (기존 유지) */}
        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          aria-label={`${study.title} 자세히 보기`}
          className="group hidden shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:translate-x-0.5 lg:block"
        >
          <ExpandCircleRightIcon className="size-12 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
