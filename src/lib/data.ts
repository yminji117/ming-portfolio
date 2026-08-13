import { createClient } from "@/lib/supabase/server";
import type {
  About,
  Career,
  CurrentlyDoing,
  Project,
  ProjectCategory,
  SiteSettings,
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
    .order("featured_order", { ascending: true })
    .limit(limit);
  if (error) console.error("getFeaturedProjects failed:", error.message);
  return data ?? [];
}

export async function getFeaturedStudies(limit: number): Promise<Study[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("is_featured", true)
    .order("featured_order", { ascending: true })
    .limit(limit);
  if (error) console.error("getFeaturedStudies failed:", error.message);
  return data ?? [];
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

const CURRENTLY_LABEL_PRIORITY: Record<string, number> = {
  doing: 0,
  want: 1,
  done: 2,
};

export async function getCurrentlyDoing(limit: number): Promise<CurrentlyDoing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("currently_doing")
    .select("*")
    .eq("is_visible", true);
  if (error) console.error("getCurrentlyDoing failed:", error.message);

  const rows = data ?? [];

  // PRD 5.7: 수동 order가 있으면 우선, 없으면 라벨 우선순위 → 시작일 최신순
  const sorted = [...rows].sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;

    const labelDiff =
      CURRENTLY_LABEL_PRIORITY[a.label] - CURRENTLY_LABEL_PRIORITY[b.label];
    if (labelDiff !== 0) return labelDiff;

    return (b.start_date ?? "").localeCompare(a.start_date ?? "");
  });

  return sorted.slice(0, limit);
}
