"use client";

import { useEffect, useState } from "react";
import {
  isBrowserExcludedFromAnalytics,
  setBrowserExcludedFromAnalytics,
} from "@/lib/analytics-session";

// 이 브라우저를 통계에서 제외 — localStorage 기반이라 서버가 초기 상태를 모른다.
// 마운트 후 클라이언트에서 읽어 표시한다(하이드레이션 불일치 방지 위해 mounted 가드).
export function ExcludeBrowserToggle() {
  const [mounted, setMounted] = useState(false);
  const [excluded, setExcluded] = useState(false);

  useEffect(() => {
    setExcluded(isBrowserExcludedFromAnalytics());
    setMounted(true);
  }, []);

  function toggle() {
    const next = !excluded;
    setBrowserExcludedFromAnalytics(next);
    setExcluded(next);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[var(--color-line)] bg-white px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-[var(--color-text)]">이 브라우저</span>
        <span className="text-[12px] text-[var(--color-text-muted)]">
          {!mounted
            ? "상태 확인 중…"
            : excluded
              ? "이 브라우저의 방문은 통계에서 빠지고 있어요. (IP가 바뀌어도 유지)"
              : "이 브라우저의 방문이 통계에 집계되고 있어요."}
        </span>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={!mounted}
        className={`shrink-0 rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-50 ${
          excluded
            ? "border border-[var(--color-line)] bg-white text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            : "bg-[var(--color-text)] text-white"
        }`}
      >
        {excluded ? "제외 해제" : "이 브라우저를 통계에서 제외"}
      </button>
    </div>
  );
}
