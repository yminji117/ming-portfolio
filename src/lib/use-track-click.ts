"use client";

import { usePathname } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics-track";
import {
  getAnalyticsDeviceCategory,
  getOrCreateAnalyticsSession,
  isBrowserExcludedFromAnalytics,
} from "@/lib/analytics-session";

// TrackedLink/TrackedExternalLink가 공유하는 클릭 트래킹 페이로드 구성.
export function useTrackClick(eventName: string, meta?: Record<string, unknown>) {
  const pathname = usePathname();
  return () => {
    if (isBrowserExcludedFromAnalytics()) return; // 제외된 브라우저면 액션도 안 보냄
    const session = getOrCreateAnalyticsSession();
    trackAnalyticsEvent({
      eventType: "action",
      eventName,
      path: pathname ?? "/",
      sessionId: session.sessionId,
      deviceCategory: getAnalyticsDeviceCategory(),
      meta,
    });
  };
}
