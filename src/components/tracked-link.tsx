"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTrackClick } from "@/lib/use-track-click";

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
  const onClick = useTrackClick(eventName, meta);

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
