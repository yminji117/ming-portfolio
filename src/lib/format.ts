function dotDate(isoDate: string): string {
  return isoDate.replaceAll("-", ".");
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

// 일자가 없는(월까지만 아는) 경력은 저장 시 day를 01로 채워두므로, 표시할 때는 생략한다.
function careerDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return d === "01" ? `${y}.${m}` : `${y}.${m}.${d}`;
}

// Figma '최종' 시안 반영 — 연혁 표기: YYYY.MM[.DD] ~ YYYY.MM[.DD]
export function formatCareerRange(
  start: string | null,
  end: string | null,
): string {
  if (!start) return "";
  if (!end) return `${careerDate(start)} ~`;
  return `${careerDate(start)} ~ ${careerDate(end)}`;
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

export function formatYear(isoDate: string | null): string {
  return isoDate ? isoDate.slice(0, 4) : "";
}

// PRD 7.3 — 방명록 등록/수정 일시 표기: YYYY.MM.DD HH:mm
export function formatDateTime(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getInitials(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  if (words.length === 1) return trimmed.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
