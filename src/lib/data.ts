import { createClient } from "@/lib/supabase/server";
import type {
  About,
  Career,
  Category,
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
    .is("deleted_at", null)
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
      .eq("category", "professional")
      .is("deleted_at", null),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category", "side")
      .is("deleted_at", null),
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

// Work(Professional/Side) 업종 + Study 카테고리 통합 목록 — 어드민 "카테고리 관리"에서
// 관리하며, 등록 페이지(Work/Study)의 선택지도 이 테이블을 그대로 쓴다.
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("scope", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) console.error("getCategories failed:", error.message);
  return data ?? [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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

// Hero 뱃지 "N건 완료" 계산용 — Professional 카테고리의 게시된 프로젝트 수만 집계
export async function getPublishedProjectsCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .eq("category", "professional")
    .is("deleted_at", null);
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

// limit 생략 시 전체 노출 — /about에서 재사용 (PRD 6.4)
// 순서: 수동 order가 있으면 최우선 → 1순위 시작일 최신순 → 2순위 종료일 최신순(라벨 구분 없음).
function sortCurrentlyDoing(rows: CurrentlyDoing[]): CurrentlyDoing[] {
  return [...rows].sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;

    const startDiff = (b.start_date ?? "").localeCompare(a.start_date ?? "");
    if (startDiff !== 0) return startDiff;

    return (b.end_date ?? "").localeCompare(a.end_date ?? "");
  });
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// 자동 생성 항목의 라벨 — Work/Study는 "하고 싶다(대기)" 상태가 없어 진행중/완료 둘 중 하나로만 판단한다.
function deriveAutoCurrentlyLabel(endDate: string | null): "doing" | "done" {
  if (!endDate) return "doing";
  return endDate < todayIso() ? "done" : "doing";
}

// Works(Professional/Side)·Study 중 게시된(미삭제) 항목을 Currently Doing 형태로 변환한다.
// 이미 수동 항목이 ref_type/ref_id로 연결해둔 프로젝트/스터디는 중복 노출을 막기 위해 제외한다.
async function buildAutoCurrentlyDoingItems(
  excludeProjectIds: Set<string>,
  excludeStudyIds: Set<string>,
): Promise<CurrentlyDoing[]> {
  const supabase = await createClient();
  const [{ data: projects, error: projectsError }, { data: studies, error: studiesError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, slug, title, category, start_date, end_date")
        .eq("status", "published")
        .is("deleted_at", null),
      supabase
        .from("studies")
        .select("id, slug, title, start_date, end_date")
        .eq("status", "published")
        .is("deleted_at", null),
    ]);
  if (projectsError) console.error("buildAutoCurrentlyDoingItems(projects) failed:", projectsError.message);
  if (studiesError) console.error("buildAutoCurrentlyDoingItems(studies) failed:", studiesError.message);

  const projectItems: CurrentlyDoing[] = (projects ?? [])
    .filter((p) => !excludeProjectIds.has(p.id))
    .map((p) => ({
      id: `auto-project-${p.id}`,
      category: p.category === "side" ? "side" : "works",
      title: p.title,
      label: deriveAutoCurrentlyLabel(p.end_date),
      start_date: p.start_date,
      end_date: p.end_date,
      ref_type: "project" as const,
      ref_id: p.id,
      ref_slug: p.slug,
      is_visible: true,
      order: null,
    }));

  const studyItems: CurrentlyDoing[] = (studies ?? [])
    .filter((s) => !excludeStudyIds.has(s.id))
    .map((s) => ({
      id: `auto-study-${s.id}`,
      category: "study" as const,
      title: s.title,
      label: deriveAutoCurrentlyLabel(s.end_date),
      start_date: s.start_date,
      end_date: s.end_date,
      ref_type: "study" as const,
      ref_id: s.id,
      ref_slug: s.slug,
      is_visible: true,
      order: null,
    }));

  return [...projectItems, ...studyItems];
}

function collectRefExclusions(rows: { ref_type: string; ref_id: string | null }[]): {
  projectIds: Set<string>;
  studyIds: Set<string>;
} {
  const projectIds = new Set<string>();
  const studyIds = new Set<string>();
  rows.forEach((row) => {
    if (!row.ref_id) return;
    if (row.ref_type === "project") projectIds.add(row.ref_id);
    if (row.ref_type === "study") studyIds.add(row.ref_id);
  });
  return { projectIds, studyIds };
}

// 수동 항목이 ref_type/ref_id로 연결해둔 프로젝트/스터디의 slug를 조회한다 —
// currently_doing 테이블엔 slug가 없어 상세 링크를 만들려면 따로 가져와야 한다.
async function resolveRefSlugs(
  projectIds: Set<string>,
  studyIds: Set<string>,
): Promise<{ projectSlugs: Map<string, string>; studySlugs: Map<string, string> }> {
  const supabase = await createClient();
  const [{ data: projects }, { data: studies }] = await Promise.all([
    projectIds.size > 0
      ? supabase.from("projects").select("id, slug").in("id", Array.from(projectIds))
      : Promise.resolve({ data: [] as { id: string; slug: string }[] }),
    studyIds.size > 0
      ? supabase.from("studies").select("id, slug").in("id", Array.from(studyIds))
      : Promise.resolve({ data: [] as { id: string; slug: string }[] }),
  ]);
  return {
    projectSlugs: new Map((projects ?? []).map((p) => [p.id, p.slug])),
    studySlugs: new Map((studies ?? []).map((s) => [s.id, s.slug])),
  };
}

function attachRefSlug(
  row: CurrentlyDoing,
  projectSlugs: Map<string, string>,
  studySlugs: Map<string, string>,
): CurrentlyDoing {
  if (!row.ref_id) return { ...row, ref_slug: null };
  const slug =
    row.ref_type === "project"
      ? (projectSlugs.get(row.ref_id) ?? null)
      : row.ref_type === "study"
        ? (studySlugs.get(row.ref_id) ?? null)
        : null;
  return { ...row, ref_slug: slug };
}

// Front(Main/About) 노출용 — 수동으로 등록한 항목(노출 처리된 것만) + Works/Study에서 자동 생성된
// 항목을 합쳐 정렬한다. 자동 항목은 수동 항목이 이미 연결해둔 프로젝트/스터디를 제외한다.
export async function getCurrentlyDoing(limit?: number): Promise<CurrentlyDoing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("currently_doing")
    .select("*")
    .eq("is_visible", true);
  if (error) console.error("getCurrentlyDoing failed:", error.message);

  const manual = data ?? [];
  const { projectIds, studyIds } = collectRefExclusions(manual);
  const [auto, { projectSlugs, studySlugs }] = await Promise.all([
    buildAutoCurrentlyDoingItems(projectIds, studyIds),
    resolveRefSlugs(projectIds, studyIds),
  ]);
  const manualWithSlug = manual.map((row) => attachRefSlug(row, projectSlugs, studySlugs));

  const sorted = sortCurrentlyDoing([...manualWithSlug, ...auto]);
  return limit != null ? sorted.slice(0, limit) : sorted;
}

// 어드민 미리보기용 — Works/Study에서 자동 생성될 항목만 반환한다(수동 항목은 getAllCurrentlyDoing).
// 어드민 세션은 숨김 처리된 수동 항목까지 전부 볼 수 있어, 숨겨둔 연결도 중복 제외 기준에 포함한다.
export async function getAutoCurrentlyDoingPreview(): Promise<CurrentlyDoing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("currently_doing").select("ref_type, ref_id");
  if (error) console.error("getAutoCurrentlyDoingPreview failed:", error.message);

  const { projectIds, studyIds } = collectRefExclusions(data ?? []);
  const auto = await buildAutoCurrentlyDoingItems(projectIds, studyIds);
  return sortCurrentlyDoing(auto);
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
