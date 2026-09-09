import { StatTile } from "@/components/admin/stat-tile";
import { AnalyticsBarList } from "@/components/admin/analytics-bar-list";
import {
  daysAgoIso,
  getAnalyticsDailyPageviews,
  getAnalyticsExcludedVisitors,
  getAnalyticsExitPages,
  getAnalyticsPageStats,
  getAnalyticsPublicStats,
  getAnalyticsTopActions,
  getAnalyticsTopPages,
  getAnalyticsTrafficSources,
} from "@/lib/analytics";
import { ExcludeIpForm } from "@/components/admin/exclude-ip-form";
import { excludeCurrentVisitor, removeExcludedVisitor } from "./actions";

const WINDOW_DAYS = 30;
const TREND_DAYS = 14;

// 체류시간(ms) → "1분 20초" / "45초" / "—"
function formatDwell(ms: number | null): string {
  if (ms == null) return "—";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}초`;
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return rest === 0 ? `${min}분` : `${min}분 ${rest}초`;
}

export default async function AdminAnalyticsPage() {
  const since = daysAgoIso(WINDOW_DAYS);

  const [
    publicStats,
    dailyPageviews,
    topPages,
    topActions,
    trafficSources,
    exitPages,
    pageStats,
    excludedVisitors,
  ] = await Promise.all([
    getAnalyticsPublicStats(),
    getAnalyticsDailyPageviews(TREND_DAYS),
    getAnalyticsTopPages(since),
    getAnalyticsTopActions(since),
    getAnalyticsTrafficSources(since),
    getAnalyticsExitPages(since),
    getAnalyticsPageStats(),
    getAnalyticsExcludedVisitors(),
  ]);

  // "어디에서 많이 머무는지" — 체류시간 있는 페이지만 중앙값 내림차순.
  const dwellPages = pageStats
    .filter((p) => p.median_dwell_ms != null)
    .sort((a, b) => (b.median_dwell_ms ?? 0) - (a.median_dwell_ms ?? 0))
    .slice(0, 10);

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
          페이지별 방문자 · 체류시간
        </h2>
        {pageStats.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">데이터가 아직 없어요.</p>
        ) : (
          <div className="overflow-x-auto rounded-[16px] border border-[var(--color-line)]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-text-muted)]">
                  <th className="px-4 py-2.5 font-medium">경로</th>
                  <th className="px-4 py-2.5 font-medium">오늘 방문자</th>
                  <th className="px-4 py-2.5 font-medium">누적 방문자</th>
                  <th className="px-4 py-2.5 font-medium">누적 PV</th>
                  <th className="px-4 py-2.5 font-medium">체류(중앙값)</th>
                </tr>
              </thead>
              <tbody>
                {pageStats.map((p) => (
                  <tr key={p.path} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="max-w-[280px] truncate px-4 py-2.5 text-[var(--color-text)]">
                      {p.path}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--color-text)]">
                      {p.today_visitors.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--color-text)]">
                      {p.total_visitors.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--color-text)]">
                      {p.total_pageviews.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--color-text)]">
                      {formatDwell(p.median_dwell_ms)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold text-[var(--color-text-muted)]">
          오래 머문 페이지 · 체류시간(중앙값)
        </h2>
        <AnalyticsBarList
          items={dwellPages.map((p) => ({
            label: `${p.path} · ${formatDwell(p.median_dwell_ms)}`,
            count: Math.round((p.median_dwell_ms ?? 0) / 1000),
          }))}
          emptyLabel="아직 체류시간 데이터가 없어요."
        />
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

      <div className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold text-[var(--color-text-muted)]">
          통계 제외 IP
        </h2>
        <p className="text-[13px] text-[var(--color-text-muted)]">
          지금 접속한 IP를 빼거나, 아는 IP를 직접 입력해 추가할 수 있어요. 그 IP의 과거 기록도
          함께 삭제되며(되돌릴 수 없어요) 앞으로도 집계되지 않아요. 네트워크(집·모바일 등)마다
          IP가 달라서 각각 등록해야 해요.
        </p>

        <form action={excludeCurrentVisitor} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="note"
            placeholder="메모(선택) — 예: 집 노트북"
            className="min-w-[200px] flex-1 rounded-[10px] border border-[var(--color-line)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)]"
          />
          <button
            type="submit"
            className="rounded-[10px] bg-[var(--color-text)] px-4 py-2 text-[13px] font-medium text-white"
          >
            현재 접속 IP를 통계에서 제외
          </button>
        </form>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--color-line)]" />
          <span className="text-[12px] text-[var(--color-text-muted)]">또는 IP 직접 입력</span>
          <span className="h-px flex-1 bg-[var(--color-line)]" />
        </div>

        <ExcludeIpForm />

        {excludedVisitors.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)]">아직 제외한 IP가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {excludedVisitors.map((v) => (
              <li
                key={v.visitor_hash}
                className="flex items-center justify-between gap-3 rounded-[12px] border border-[var(--color-line)] px-4 py-2.5 text-[13px]"
              >
                <span className="min-w-0 truncate text-[var(--color-text)]">
                  <span className="font-mono">{v.visitor_hash.slice(0, 12)}…</span>
                  {v.note ? <span className="text-[var(--color-text-muted)]"> · {v.note}</span> : null}
                  <span className="text-[var(--color-text-muted)]">
                    {" · "}
                    {new Date(v.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </span>
                <form action={removeExcludedVisitor}>
                  <input type="hidden" name="hash" value={v.visitor_hash} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-[8px] border border-[var(--color-line)] px-3 py-1.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
                  >
                    해제
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
