// 썸네일/이미지를 등록하지 않은 항목에 공통으로 쓰는 기본 이미지(public/basic).
export const DEFAULT_THUMBNAIL = "/basic/Thumbnail_basic.png";

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

// projects.industry는 0032_project_industry_array.sql 적용 전엔 DB에 아직 단일 문자열(text)로
// 남아있을 수 있다 — 마이그레이션 적용 전에도 카드/필터가 죽지 않도록 방어적으로 배열화한다.
export function normalizeIndustry(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

// 필터 칩·카드 태그·상세 카테고리 등 업종이 노출되는 모든 곳이 공유하는 정렬 순서(카테고리
// 관리에서 정한 순서). order에 없는 값(삭제된 카테고리 등)은 순서 뒤에 알파벳순으로 붙는다.
export function sortIndustries(industries: string[], order: string[]): string[] {
  return [...industries].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

// /works Side 탭 필터 칩에서만 제외할 값 — 카드 라벨·데이터·어드민 선택지는 그대로 두고
// 필터 칩 노출에서만 뺀다(요청: "Online, Offline은 필터에만 삭제, 다른 곳은 유지").
const FILTER_EXCLUDED_INDUSTRIES: Record<"professional" | "side", string[]> = {
  professional: [],
  side: ["Online", "Offline"],
};

export function getFilterableIndustries(
  industries: string[],
  category: "professional" | "side",
): string[] {
  const excluded = FILTER_EXCLUDED_INDUSTRIES[category];
  return industries.filter((industry) => !excluded.includes(industry));
}

// Study는 "카테고리"(주제 — Figma node 355:1062)와 "형태"(Online/Offline — node 355:999)가
// 별개 개념이지만, DB엔 이 둘을 나누는 컬럼이 따로 없고 studies.tags 배열 하나뿐이다.
// 어드민에서 두 필드로 분리해 보여주고 저장은 같은 tags 배열에 합쳐서 한다. 카테고리 값 자체는
// 어드민 "카테고리 관리"에서 관리하고, 형태(Online/Offline)만 고정 2개라 여기 하드코딩한다.
const STUDY_FORMAT_OPTIONS = ["Online", "Offline"];

// 형태 — Online/Offline 중 선택. 카테고리와 달리 고정된 2개뿐이라 직접 입력은 없다.
export function getStudyFormatOptions(): string[] {
  return STUDY_FORMAT_OPTIONS;
}

// /study 필터 칩 순서 — Works의 sortIndustries와 동일한 방식. order에 없는 값(어드민에서
// 직접 입력으로 추가된 값)은 알파벳순으로 뒤에 이어 붙인다.
// (형태값(Online/Offline)은 별도 개념이라 호출하는 쪽에서 미리 걸러내고 넘겨야 한다.)
export function sortStudyCategories(categories: string[], order: string[]): string[] {
  return [...categories].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

// Front에 노출되는 Study 태그 배지 순서 — 카테고리(정해진 값이든 어드민에서 직접 입력한
// 커스텀 값이든)가 항상 형태(Online/Offline)보다 앞에 오도록 정렬한다. 어드민에서 어떤
// 순서로 선택했는지와 무관하다. 형태가 아닌 값은 전부 "카테고리"로 취급해, 목록에 없는
// 커스텀 카테고리도 형태보다 뒤로 밀리지 않는다.
export function sortStudyTagsForDisplay(tags: string[], order: string[]): string[] {
  const rank = (tag: string) => {
    const formatIndex = STUDY_FORMAT_OPTIONS.indexOf(tag);
    if (formatIndex !== -1) return order.length + 1 + formatIndex;
    const categoryIndex = order.indexOf(tag);
    if (categoryIndex !== -1) return categoryIndex;
    return order.length; // 커스텀 카테고리 — 정해진 카테고리들 뒤, 형태보다는 앞
  };
  return [...tags].sort((a, b) => rank(a) - rank(b));
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
