import type { Study } from "@/lib/types";

// PRD 6.3 — 외부 링크형 스터디는 리스트/Main 어디서든 바로 외부로 이동하고 상세 페이지를 만들지 않는다.
export function getStudyHref(study: Study): { href: string; isExternal: boolean } {
  return {
    href: study.external_url ?? `/study/${study.slug}`,
    isExternal: Boolean(study.external_url),
  };
}
