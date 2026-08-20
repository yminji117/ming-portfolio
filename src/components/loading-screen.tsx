"use client";

import { useEffect, useState } from "react";
import { Lottie } from "lottie-react";
import catAnimation from "@/lottie/cat-movement.json";

/**
 * 전체 화면 로딩 오버레이 — 고양이 Lottie 애니메이션을 중앙에 100px 크기로 표시한다.
 * `src/app/loading.tsx`(App Router Suspense fallback)에서 사용하며,
 * 재사용을 위해 별도 컴포넌트로 분리했다.
 */
export function LoadingScreen() {
  // prefers-reduced-motion 접근성 가드 — globals.css의 CSS 애니메이션 클램프는
  // Lottie(JS/SVG 프레임 구동)에는 적용되지 않으므로 별도로 감지해 자동재생을 끈다.
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]">
      <div className="h-[100px] w-[100px]">
        <Lottie
          src={catAnimation}
          loop={!reducedMotion}
          autoplay={!reducedMotion}
        />
      </div>
    </div>
  );
}
