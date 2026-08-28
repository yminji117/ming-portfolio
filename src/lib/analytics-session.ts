// 브라우저 전용 헬퍼 — analytics-tracker.tsx(pageview)와 TrackedLink/TrackedExternalLink(action)가
// 공통으로 쓰는 세션 부트스트랩 로직. 세션 ID/최초 진입 referrer·UTM은 sessionStorage에만 저장한다
// (탭 종료 시 소멸, 영구 쿠키 아님 — 쿠키 동의 배너가 필요해지지 않는다).

const SESSION_KEY = "mj_analytics_session";

export type AnalyticsSession = {
  sessionId: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

export function getOrCreateAnalyticsSession(): AnalyticsSession {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as AnalyticsSession;
  } catch {
    // sessionStorage 접근 불가(프라이빗 모드 등) — 매번 새 세션으로 취급해도 트래킹 자체는 동작
  }

  const params = new URLSearchParams(window.location.search);
  const session: AnalyticsSession = {
    sessionId: crypto.randomUUID(),
    referrer: document.referrer || "",
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
  };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // 저장 실패해도 이번 요청의 세션 값 자체는 그대로 사용
  }

  return session;
}

export function getAnalyticsDeviceCategory(): string {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}
