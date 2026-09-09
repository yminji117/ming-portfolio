"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackAnalyticsDwell, trackAnalyticsEvent } from "@/lib/analytics-track";
import {
  getAnalyticsDeviceCategory,
  getOrCreateAnalyticsSession,
  isBrowserExcludedFromAnalytics,
} from "@/lib/analytics-session";

// 화면에는 아무것도 렌더링하지 않는 방문 기록 컴포넌트. 경로가 바뀔 때마다(최초 진입 포함)
// pageview 이벤트를 서버로 보낸다. React StrictMode의 이중 effect 실행은 ref로 걸러진다
// (동일 경로 재전송은 analytics_track_event RPC 쪽에서도 3초 내 중복으로 한 번 더 막는다).
//
// 체류시간: 경로가 바뀌기 직전(이전 페이지)과 탭이 숨겨질 때(현재 페이지) 머문 시간을 보낸다.
// 서버가 greatest()로 합치므로 중복 전송은 안전. 백그라운드 유휴시간을 빼기 위해 다시
// 보일 때 진입 시각을 리셋해 "마지막 포그라운드 구간"만 측정한다.
export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);
  const currentPath = useRef<string | null>(null);
  const enteredAt = useRef<number>(0);
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTrackedPath.current === pathname) return;
    // 어드민 화면(/admin)은 통계에서 제외 — 운영 활동은 방문 통계에 넣지 않는다.
    if (pathname.startsWith("/admin")) return;
    // 이 브라우저가 통계 제외로 표시돼 있으면 아무 것도 보내지 않는다(유동 IP와 무관하게 안정적).
    if (isBrowserExcludedFromAnalytics()) return;
    lastTrackedPath.current = pathname;

    const session = getOrCreateAnalyticsSession();
    sessionId.current = session.sessionId;

    // 이전 페이지의 체류시간 먼저 전송
    if (currentPath.current && currentPath.current !== pathname) {
      trackAnalyticsDwell(session.sessionId, currentPath.current, Date.now() - enteredAt.current);
    }

    trackAnalyticsEvent({
      eventType: "pageview",
      path: pathname,
      referrer: session.referrer || undefined,
      utmSource: session.utmSource || undefined,
      utmMedium: session.utmMedium || undefined,
      utmCampaign: session.utmCampaign || undefined,
      sessionId: session.sessionId,
      deviceCategory: getAnalyticsDeviceCategory(),
    });

    currentPath.current = pathname;
    enteredAt.current = Date.now();
  }, [pathname]);

  useEffect(() => {
    function onVisibilityChange() {
      if (isBrowserExcludedFromAnalytics()) return;
      if (document.visibilityState === "hidden") {
        if (sessionId.current && currentPath.current) {
          trackAnalyticsDwell(
            sessionId.current,
            currentPath.current,
            Date.now() - enteredAt.current,
          );
        }
      } else {
        // 다시 포그라운드로 — 백그라운드 유휴시간이 체류시간에 섞이지 않도록 구간 재시작
        enteredAt.current = Date.now();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return null;
}
