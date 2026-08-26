import { createClient } from "@/lib/supabase/server";
import { getStudyFormatOptions, normalizeIndustry } from "@/lib/format";
import type {
  About,
  Career,
  CurrentlyDoing,
  GuestbookEntry,
  Project,
  ProjectCategory,
  SiteSettings,
  Skill,
  Study,
} from "@/lib/types";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .single();
  if (error) console.error("getSiteSettings failed:", error.message);
  return data;
}

export async function getFeaturedProjects(
  category: ProjectCategory,
  limit: number,
): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("category", category)
    .eq("is_featured", true)
    .is("deleted_at", null)
    .order("featured_order", { ascending: true })
    .limit(limit);
  if (error) console.error("getFeaturedProjects failed:", error.message);
  return data ?? [];
}

export async function getProjectsPage(
  category: ProjectCategory,
  offset: number,
  limit: number,
): Promise<{ items: Project[]; total: number }> {
  const supabase = await createClient();
  // /works 리스트 기본 정렬: 핀 고정 우선 → 최신순(start_date desc) → 동률은 id desc로 안정 정렬
  const { data, error, count } = await supabase
    .from("projects")
    .select("*", { count: "exact" })
    .eq("category", category)
    .order("is_pinned", { ascending: false })
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) console.error("getProjectsPage failed:", error.message);
  return { items: data ?? [], total: count ?? 0 };
}

export async function getProjectCategoryCounts(): Promise<
  Record<ProjectCategory, number>
> {
  const supabase = await createClient();
  const [professional, side] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category", "professional"),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category", "side"),
  ]);
  if (professional.error)
    console.error("getProjectCategoryCounts(professional) failed:", professional.error.message);
  if (side.error)
    console.error("getProjectCategoryCounts(side) failed:", side.error.message);
  return {
    professional: professional.count ?? 0,
    side: side.count ?? 0,
  };
}

// 어드민 업종 선택 필드용 — 지금까지 어떤 프로젝트에서든 실제로 쓰인 업종 값을
// 분류별로 모아준다. "+ 직접 입력"으로 한 번 추가된 값도 다음 프로젝트부터는
// 재입력 없이 선택지(pill)로 바로 고를 수 있게 하기 위함(오타 방지).
export async function getKnownIndustries(): Promise<Record<ProjectCategory, string[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("category, industry")
    .is("deleted_at", null);
  if (error) console.error("getKnownIndustries failed:", error.message);

  const seen: Record<ProjectCategory, Set<string>> = {
    professional: new Set(),
    side: new Set(),
  };
  (data ?? []).forEach((row) => {
    const category = row.category as ProjectCategory;
    normalizeIndustry(row.industry).forEach((industry) => seen[category].add(industry));
  });
  return {
    professional: Array.from(seen.professional),
    side: Array.from(seen.side),
  };
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) console.error("getProjectBySlug failed:", error.message);
  return data;
}

// 상세 페이지 "← 이전 / 다음 →" 네비게이션 — 리스트와 동일 정렬 기준으로 이웃 slug만 조회
export async function getAdjacentProjects(
  category: ProjectCategory,
  currentSlug: string,
): Promise<{ prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug, title")
    .eq("category", category)
    .order("is_pinned", { ascending: false })
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });
  if (error) {
    console.error("getAdjacentProjects failed:", error.message);
    return { prev: null, next: null };
  }
  const items = data ?? [];
  const index = items.findIndex((item) => item.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
  };
}

// 어드민 스터디 카테고리 선택 필드용 — getKnownIndustries와 동일한 목적으로, 지금까지 어떤
// 스터디에서든 "+ 직접 입력"으로 쓰인 카테고리 값을 모아준다. 형태(Online/Offline)는 별개
// 필드(StudyFormatField)가 관리하므로 여기서는 제외한다.
export async function getKnownStudyCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studies")
    .select("tags")
    .is("deleted_at", null);
  if (error) console.error("getKnownStudyCategories failed:", error.message);

  const formatOptions = getStudyFormatOptions();
  const seen = new Set<string>();
  (data ?? []).forEach((row) => {
    (row.tags ?? []).forEach((tag: string) => {
      if (!formatOptions.includes(tag)) seen.add(tag);
    });
  });
  return Array.from(seen);
}

export async function getFeaturedStudies(limit: number): Promise<Study[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("is_featured", true)
    .is("deleted_at", null)
    .order("featured_order", { ascending: true })
    .limit(limit);
  if (error) console.error("getFeaturedStudies failed:", error.message);
  return data ?? [];
}

export async function getStudiesPage(
  offset: number,
  limit: number,
): Promise<{ items: Study[]; total: number }> {
  const supabase = await createClient();
  // /study 리스트 기본 정렬: 핀 고정 우선 → 최신순(start_date desc) → 동률은 id desc로 안정 정렬
  const { data, error, count } = await supabase
    .from("studies")
    .select("*", { count: "exact" })
    .order("is_pinned", { ascending: false })
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) console.error("getStudiesPage failed:", error.message);
  return { items: data ?? [], total: count ?? 0 };
}

export async function getStudyBySlug(slug: string): Promise<Study | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) console.error("getStudyBySlug failed:", error.message);
  return data;
}

export async function getAdjacentStudies(
  currentSlug: string,
): Promise<{ prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studies")
    .select("slug, title")
    .order("is_pinned", { ascending: false })
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });
  if (error) {
    console.error("getAdjacentStudies failed:", error.message);
    return { prev: null, next: null };
  }
  const items = data ?? [];
  const index = items.findIndex((item) => item.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
  };
}

export async function getAbout(): Promise<About | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("about").select("*").single();
  if (error) console.error("getAbout failed:", error.message);
  return data;
}

// Hero 뱃지 "N년차" 계산용 — 가장 이른 회사 경력 시작일 기준
export async function getCareerYears(): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("careers")
    .select("start_date")
    .eq("type", "company")
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) console.error("getCareerYears failed:", error.message);
  if (!data?.start_date) return null;

  const startYear = new Date(data.start_date).getFullYear();
  const currentYear = new Date().getFullYear();
  return Math.max(1, currentYear - startYear + 1);
}

// Hero 뱃지 "N건 완료" 계산용 — 게시된 프로젝트 총 개수
export async function getPublishedProjectsCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  if (error) console.error("getPublishedProjectsCount failed:", error.message);
  return count ?? 0;
}

export async function getLatestCompanyCareers(limit: number): Promise<Career[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .eq("type", "company")
    .order("start_date", { ascending: false })
    .limit(limit);
  if (error) console.error("getLatestCompanyCareers failed:", error.message);
  return data ?? [];
}

// /about 연혁 타임라인 — 학교/어학연수/회사 전체, 시간 역순
export async function getAllCareers(): Promise<Career[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .order("start_date", { ascending: false });
  if (error) console.error("getAllCareers failed:", error.message);
  return data ?? [];
}

export async function getSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("order", { ascending: true });
  if (error) console.error("getSkills failed:", error.message);
  return data ?? [];
}

const CURRENTLY_LABEL_PRIORITY: Record<string, number> = {
  doing: 0,
  want: 1,
  done: 2,
};

// limit 생략 시 전체 노출 — /about에서 재사용 (PRD 6.4)
// PRD 5.7: 수동 order가 있으면 우선, 없으면 라벨 우선순위 → 시작일 최신순
function sortCurrentlyDoing(rows: CurrentlyDoing[]): CurrentlyDoing[] {
  return [...rows].sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;

    const labelDiff =
      CURRENTLY_LABEL_PRIORITY[a.label] - CURRENTLY_LABEL_PRIORITY[b.label];
    if (labelDiff !== 0) return labelDiff;

    return (b.start_date ?? "").localeCompare(a.start_date ?? "");
  });
}

export async function getCurrentlyDoing(limit?: number): Promise<CurrentlyDoing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("currently_doing")
    .select("*")
    .eq("is_visible", true);
  if (error) console.error("getCurrentlyDoing failed:", error.message);

  const sorted = sortCurrentlyDoing(data ?? []);
  return limit != null ? sorted.slice(0, limit) : sorted;
}

// 어드민 Currently Doing 관리용 — 노출/비노출 전부 보여준다(is_visible 필터 없음).
export async function getAllCurrentlyDoing(): Promise<CurrentlyDoing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("currently_doing").select("*");
  if (error) console.error("getAllCurrentlyDoing failed:", error.message);
  return sortCurrentlyDoing(data ?? []);
}

// Currently Doing "연결" 필드용 — 프로젝트/스터디를 제목으로 고를 수 있게 최소 정보만 가져온다.
export async function getProjectsForSelect(): Promise<{ id: string; title: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title")
    .is("deleted_at", null)
    .order("title", { ascending: true });
  if (error) console.error("getProjectsForSelect failed:", error.message);
  return data ?? [];
}

export async function getStudiesForSelect(): Promise<{ id: string; title: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studies")
    .select("id, title")
    .is("deleted_at", null)
    .order("title", { ascending: true });
  if (error) console.error("getStudiesForSelect failed:", error.message);
  return data ?? [];
}

// PRD 7.3 — guestbook_public 뷰만 사용(content/password_hash 없음), 등록 일시 최신순 페이지네이션
export async function getGuestbookPage(
  offset: number,
  limit: number,
): Promise<{ items: GuestbookEntry[]; total: number }> {
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("guestbook_public")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) console.error("getGuestbookPage failed:", error.message);
  return { items: data ?? [], total: count ?? 0 };
}
