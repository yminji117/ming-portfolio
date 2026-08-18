function dotDate(isoDate: string): string {
  return isoDate.replaceAll("-", ".");
}

function yearMonth(isoDate: string): string {
  const [y, m] = isoDate.split("-");
  return `${y}.${m}`;
}

// PRD 5.7 — Currently Doing 일자 표기 규칙
export function formatCurrentlyRange(
  start: string | null,
  end: string | null,
): string {
  if (!start) return "미정";
  if (!end) return `${dotDate(start)} ~ `;
  if (start === end) return dotDate(start);
  return `${dotDate(start)} ~ ${dotDate(end)}`;
}

// PRD 5.6 — 연혁 표기: YYYY.MM ~ YYYY.MM
export function formatCareerRange(
  start: string | null,
  end: string | null,
): string {
  if (!start) return "";
  if (!end) return `${yearMonth(start)} ~`;
  return `${yearMonth(start)} ~ ${yearMonth(end)}`;
}

export function getInstagramHandle(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\//g, "");
    return path ? `@${path}` : url;
  } catch {
    return url;
  }
}

// Works Professional 필터 칩과 카드 태그에 공통으로 쓰는 업종 표시 라벨.
// project.industry의 DB 원본 값(필터링 기준)과 화면 노출 텍스트를 분리한다.
const INDUSTRY_LABELS: Record<string, string> = {
  Education: "EdTech",
  Brand: "Brand Site",
};

export function getIndustryLabel(industry: string): string {
  return INDUSTRY_LABELS[industry] ?? industry;
}

export function getInitials(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  if (words.length === 1) return trimmed.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
