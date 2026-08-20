"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LoadingScreen } from "@/components/loading-screen";

// 새로고침 시 히어로 영상의 poster(About 사진)가 잠깐 보였다가 실제 영상으로
// 바뀌는 게 눈에 띄어서, 브라우저의 모든 리소스(영상 포함) 로딩이 끝날 때까지
// 로딩 화면으로 콘텐츠를 가려둔다. 콘텐츠 자체는 계속 마운트된 상태로 두어
// (visibility만 숨김) 영상이 백그라운드에서 미리 로드되도록 한다.
export function PageLoadGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete") {
      setReady(true);
      return;
    }
    function handleLoad() {
      setReady(true);
    }
    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  return (
    <>
      {!ready && <LoadingScreen />}
      <div className={ready ? "" : "invisible"}>{children}</div>
    </>
  );
}
