import { createClient } from "@/lib/supabase/server";
import type {
  AnalyticsDailyPoint,
  AnalyticsExcludedVisitor,
  AnalyticsExitPage,
  AnalyticsPageStat,
  AnalyticsPublicStats,
  AnalyticsTopAction,
  AnalyticsTopPage,
  AnalyticsTrafficSource,
} from "@/lib/types";

// 어드민 대시보드(Server Component)가 렌더 본문에서 직접 Date.now()를 호출하면
// react-hooks/purity 린트가 "컴포넌트는 순수해야 한다"며 막는다 — 평범한 헬퍼 함수로 빼서 호출한다.
export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// Front 공개 위젯용 — anon도 읽을 수 있는 집계 전용 뷰(개별 방문자 정보 없음).
export async function getAnalyticsPublicStats(): Promise<AnalyticsPublicStats | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("analytics_public_stats").select("*").single();
  if (error) console.error("getAnalyticsPublicStats failed:", error.message);
  return data;
}

// 아래는 전부 authenticated(관리자) 세션에서만 값을 반환한다 — RPC 자체는 anon도 호출은
// 가능하지만(0043에서 authenticated에만 grant) anon 세션에선 permission denied로 실패한다.
export async function getAnalyticsDailyPageviews(days = 14): Promise<AnalyticsDailyPoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_daily_pageviews", { p_days: days });
  if (error) console.error("getAnalyticsDailyPageviews failed:", error.message);
  return data ?? [];
}

export async function getAnalyticsTopPages(since: string, limit = 10): Promise<AnalyticsTopPage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_top_pages", {
    p_since: since,
    p_limit: limit,
  });
  if (error) console.error("getAnalyticsTopPages failed:", error.message);
  return data ?? [];
}

export async function getAnalyticsTopActions(
  since: string,
  limit = 10,
): Promise<AnalyticsTopAction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_top_actions", {
    p_since: since,
    p_limit: limit,
  });
  if (error) console.error("getAnalyticsTopActions failed:", error.message);
  return data ?? [];
}

export async function getAnalyticsTrafficSources(
  since: string,
  limit = 10,
): Promise<AnalyticsTrafficSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_traffic_sources", {
    p_since: since,
    p_limit: limit,
  });
  if (error) console.error("getAnalyticsTrafficSources failed:", error.message);
  return data ?? [];
}

export async function getAnalyticsExitPages(
  since: string,
  limit = 10,
): Promise<AnalyticsExitPage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_exit_pages", {
    p_since: since,
    p_limit: limit,
  });
  if (error) console.error("getAnalyticsExitPages failed:", error.message);
  return data ?? [];
}

// 페이지별(상세 포함) 오늘/누적 방문자·페이지뷰 + 중앙 체류시간.
export async function getAnalyticsPageStats(limit = 50): Promise<AnalyticsPageStat[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_page_stats", { p_limit: limit });
  if (error) console.error("getAnalyticsPageStats failed:", error.message);
  return data ?? [];
}

// 통계에서 제외 중인 IP 목록(관리자 세션에서만 값이 나옴 — RLS).
export async function getAnalyticsExcludedVisitors(): Promise<AnalyticsExcludedVisitor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analytics_excluded_visitors")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("getAnalyticsExcludedVisitors failed:", error.message);
  return data ?? [];
}
