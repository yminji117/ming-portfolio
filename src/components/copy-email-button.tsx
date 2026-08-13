"use client";

import { useState } from "react";

export function CopyEmailButton({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 실패 시 시각적 피드백만 생략 (동작에는 영향 없음)
    }
  }

  return (
    <button type="button" onClick={handleCopy} className={className}>
      {email}
      <span
        aria-live="polite"
        className="ml-3 align-middle text-[length:var(--fs-caption)] text-[var(--color-text-muted)]"
      >
        {copied ? "복사되었습니다" : ""}
      </span>
    </button>
  );
}
