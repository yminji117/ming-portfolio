"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics-track";
import { getAnalyticsDeviceCategory, getOrCreateAnalyticsSession } from "@/lib/analytics-session";

// 화면에는 아무것도 렌더링하지 않는 방문 기록 컴포넌트. 경로가 바뀔 때마다(최초 진입 포함)
// pageview 이벤트를 서버로 보낸다. React StrictMode의 이중 effect 실행은 ref로 걸러진다
// (동일 경로 재전송은 analytics_track_event RPC 쪽에서도 3초 내 중복으로 한 번 더 막는다).
export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const session = getOrCreateAnalyticsSession();
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
  }, [pathname]);

  return null;
}
