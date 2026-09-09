"use server";

import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// 어드민(로그인 상태)의 활동은 통계에 수집하지 않는다. 이 사이트에서 Supabase 인증 세션을
// 가진 사용자는 운영자뿐이므로, 인증 쿠키(sb-...-auth-token) 존재만으로 판별한다
// (getUser() 네트워크 검증 없이 — 추적은 모든 방문마다 도는 경로라 가볍게 유지).
async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.getAll().some((c) => /^sb-.*-auth-token(\.\d+)?$/.test(c.name) && !!c.value);
}

// 실제 브라우저 IP를 SHA-256 해시한다(raw IP는 저장하지 않음). 서버 액션의 headers()에
// 담긴 x-forwarded-for(Vercel 엣지가 세팅한 클라이언트 IP)를 쓴다 — Postgres의
// request.headers는 서버→Supabase 요청 헤더라 브라우저 IP가 아니므로 여기서 직접 넘긴다.
// 추적과 "IP 제외"가 이 동일 함수를 써야 같은 IP가 같은 해시로 매칭된다.
export async function getVisitorHash(): Promise<string> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

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
    if (await isAdminRequest()) return; // 어드민 활동은 수집하지 않음
    const headerList = await headers();
    const userAgent = headerList.get("user-agent");
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const visitorHash = createHash("sha256").update(ip).digest("hex");

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
      p_visitor_hash: visitorHash,
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
    if (await isAdminRequest()) return; // 어드민 활동은 수집하지 않음
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
