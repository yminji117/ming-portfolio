import { StatTile } from "@/components/admin/stat-tile";
import { AnalyticsBarList } from "@/components/admin/analytics-bar-list";
import {
  daysAgoIso,
  getAnalyticsDailyPageviews,
  getAnalyticsExitPages,
  getAnalyticsPublicStats,
  getAnalyticsTopActions,
  getAnalyticsTopPages,
  getAnalyticsTrafficSources,
} from "@/lib/analytics";

const WINDOW_DAYS = 30;
const TREND_DAYS = 14;

export default async function AdminAnalyticsPage() {
  const since = daysAgoIso(WINDOW_DAYS);

  const [publicStats, dailyPageviews, topPages, topActions, trafficSources, exitPages] =
    await Promise.all([
      getAnalyticsPublicStats(),
      getAnalyticsDailyPageviews(TREND_DAYS),
      getAnalyticsTopPages(since),
      getAnalyticsTopActions(since),
      getAnalyticsTrafficSources(since),
      getAnalyticsExitPages(since),
    ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">방문 통계</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          최근 {WINDOW_DAYS}일 기준. sessionStorage 세션 단위로 근사한 통계입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatTile label="오늘 방문자" value={publicStats?.today_visitors ?? 0} tone="accent" />
        <StatTile label="오늘 페이지뷰" value={publicStats?.today_pageviews ?? 0} />
        <StatTile label="누적 방문자" value={publicStats?.total_visitors ?? 0} />
        <StatTile label="누적 페이지뷰" value={publicStats?.total_pageviews ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-muted)]">
            인기 페이지 · 최근 {WINDOW_DAYS}일
          </h2>
          <AnalyticsBarList
            items={topPages.map((p) => ({ label: p.path, count: p.pageviews }))}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-muted)]">
            유입 경로 · 최근 {WINDOW_DAYS}일
          </h2>
          <AnalyticsBarList
            items={trafficSources.map((s) => ({ label: s.source, count: s.sessions }))}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-muted)]">
            액션 · 최근 {WINDOW_DAYS}일
          </h2>
          <AnalyticsBarList
            items={topActions.map((a) => ({ label: a.event_name, count: a.action_count }))}
            emptyLabel="아직 계측된 액션이 없어요."
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-muted)]">
            이탈 지점 · 최근 {WINDOW_DAYS}일
          </h2>
          <AnalyticsBarList
            items={exitPages.map((e) => ({ label: e.path, count: e.exits }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold text-[var(--color-text-muted)]">
          일별 추세 · 최근 {TREND_DAYS}일
        </h2>
        {dailyPageviews.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">데이터가 아직 없어요.</p>
        ) : (
          <div className="overflow-x-auto rounded-[16px] border border-[var(--color-line)]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-text-muted)]">
                  <th className="px-4 py-2.5 font-medium">날짜</th>
                  <th className="px-4 py-2.5 font-medium">페이지뷰</th>
                  <th className="px-4 py-2.5 font-medium">순방문자</th>
                </tr>
              </thead>
              <tbody>
                {dailyPageviews.map((point) => (
                  <tr key={point.day} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="px-4 py-2.5 tabular-nums text-[var(--color-text)]">{point.day}</td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--color-text)]">
                      {point.pageviews.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--color-text)]">
                      {point.unique_visitors.toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
