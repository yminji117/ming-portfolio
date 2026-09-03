"use client";

import type { ReactNode } from "react";
import { useTrackClick } from "@/lib/use-track-click";

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
  const onClick = useTrackClick(eventName, meta);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
      {children}
    </a>
  );
}
