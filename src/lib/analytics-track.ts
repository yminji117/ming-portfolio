"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AnalyticsEventInput = {
  eventType: "pageview" | "action";
  eventName?: string;
  path: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  sessionId: string;
  deviceCategory?: string;
  meta?: Record<string, unknown>;
};

// 방명록의 guestbook_insert와 동일한 신뢰 경계 원칙 — 악용 방지/IP 해시는 전부
// analytics_track_event RPC(DB) 안에서 처리된다. 이 액션은 입력을 그대로 전달만 하고,
// 실패해도 화면 동작에 영향을 주면 안 되므로 절대 throw하지 않는다.
export async function trackAnalyticsEvent(input: AnalyticsEventInput): Promise<void> {
  try {
    const headerList = await headers();
    const userAgent = headerList.get("user-agent");

    const supabase = await createClient();
    const { error } = await supabase.rpc("analytics_track_event", {
      p_event_type: input.eventType,
      p_event_name: input.eventName ?? null,
      p_path: input.path,
      p_referrer: input.referrer ?? null,
      p_utm_source: input.utmSource ?? null,
      p_utm_medium: input.utmMedium ?? null,
      p_utm_campaign: input.utmCampaign ?? null,
      p_session_id: input.sessionId,
      p_device_category: input.deviceCategory ?? null,
      p_meta: input.meta ?? null,
      p_user_agent: userAgent,
    });

    if (error) {
      console.error("trackAnalyticsEvent failed:", error.message);
    }
  } catch (err) {
    console.error("trackAnalyticsEvent threw:", err);
  }
}

// 페이지 체류시간 기록 — 이탈/전환/탭 숨김 시점에 그 페이지의 머문 시간을 보낸다.
// trackAnalyticsEvent와 동일하게 실패해도 화면에 영향 없도록 절대 throw하지 않는다.
export async function trackAnalyticsDwell(
  sessionId: string,
  path: string,
  durationMs: number,
): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("analytics_track_dwell", {
      p_session_id: sessionId,
      p_path: path,
      p_duration_ms: Math.round(durationMs),
    });
    if (error) {
      console.error("trackAnalyticsDwell failed:", error.message);
    }
  } catch (err) {
    console.error("trackAnalyticsDwell threw:", err);
  }
}
