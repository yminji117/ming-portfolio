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

// Works/Study 리스트 카드에 쓰는 전체 날짜 범위 표기: YYYY.MM.DD ~ YYYY.MM.DD
// (연혁의 formatCareerRange와 달리 day를 절대 생략하지 않는다 — Figma '최종' 리스트 카드 반영)
export function formatProjectRange(start: string | null, end: string | null): string {
  if (!start) return "";
  if (!end) return `${dotDate(start)} ~`;
  return `${dotDate(start)} ~ ${dotDate(end)}`;
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

// Figma '최종' 시안의 필터 칩 노출 순서 — 카테고리별로 고정 순서를 따르고,
// 목록에 없는 값(향후 추가된 industry)은 정해진 순서 뒤에 그대로 이어 붙인다.
const INDUSTRY_ORDER: Record<"professional" | "side", string[]> = {
  professional: ["Education", "OTT", "Commerce", "Brand"],
  side: ["Community", "Popup", "Online", "Offline"],
};

export function sortIndustries(
  industries: string[],
  category: "professional" | "side",
): string[] {
  const order = INDUSTRY_ORDER[category];
  return [...industries].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
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

// Figma '최종' Work 카드 '결과 요약 + 남은 개수' 배지 — project.result는 줄바꿈으로
// 구분된 여러 성과 항목을 담는다. 첫 줄만 미리보기로 보여주고, 나머지 개수를 배지로 표시한다.
export function getResultPreview(
  result: string | null,
): { text: string; remainingCount: number } | null {
  if (!result) return null;
  const lines = result
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return { text: lines[0], remainingCount: lines.length - 1 };
}

export function getInitials(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  if (words.length === 1) return trimmed.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
