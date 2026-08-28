"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics-track";
import { getAnalyticsDeviceCategory, getOrCreateAnalyticsSession } from "@/lib/analytics-session";

// next/link의 얇은 래퍼 — 페이지 이동은 그대로 두고, 클릭 시 action 이벤트만 하나 더 보낸다.
export function TrackedLink({
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
    <Link
      href={href}
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
    </Link>
  );
}
