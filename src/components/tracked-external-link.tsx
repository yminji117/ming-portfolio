"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics-track";
import { getAnalyticsDeviceCategory, getOrCreateAnalyticsSession } from "@/lib/analytics-session";

// 외부 링크(<a target="_blank">)의 얇은 래퍼 — 클릭 시 action 이벤트를 보낸다.
export function TrackedExternalLink({
  href,
  eventName,
  meta,
  className,
  children,
}: {
  href: string;
  eventName: string;
  meta?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        const session = getOrCreateAnalyticsSession();
        trackAnalyticsEvent({
          eventType: "action",
          eventName,
          path: pathname ?? "/",
          sessionId: session.sessionId,
          deviceCategory: getAnalyticsDeviceCategory(),
          meta,
        });
      }}
    >
      {children}
    </a>
  );
}
