"use client";

import Link from "next/link";
import { useEffect } from "react";

// PRD 12.3 — 예외 상황 공통 에러 화면 (error.tsx는 Next.js 규칙상 반드시 Client Component)
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p
        className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight"
        style={{ fontSize: "var(--fs-display-xl)" }}
      >
        오류가 발생했어요
      </p>
      <p className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
        페이지를 불러오는 중 문제가 생겼어요. 다시 시도해주세요.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-accent)] px-8 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02]"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-line)] px-8 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
