"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LoadingScreen } from "@/components/loading-screen";

// 히어로 영상이 "재생 가능"해질 때까지 기다려주는 최대 시간 — 브라우저 자동재생 정책 등으로
// video의 playing 이벤트가 끝내 안 뜨는 경우를 대비한 안전장치.
const VIDEO_READY_TIMEOUT_MS = 4000;

// 새로고침 시 히어로 영상의 poster(About 사진)가 잠깐 보였다가 실제 영상 프레임으로
// 바뀌는 게 눈에 띄어서, window.load뿐 아니라 실제로 <video>가 프레임을 그릴 수 있는
// 상태(재생 시작 또는 첫 프레임 디코딩 완료)가 될 때까지 로딩 화면으로 콘텐츠를 가려둔다.
// 콘텐츠 자체는 계속 마운트된 상태로 두어(visibility만 숨김) 영상이 백그라운드에서
// 미리 로드/재생되도록 한다.
export function PageLoadGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function reveal() {
      if (!cancelled) setReady(true);
    }

    function waitForVideos() {
      const videos = Array.from(document.querySelectorAll("video"));
      if (videos.length === 0) {
        reveal();
        return;
      }

      const pending = new Set(videos);
      timeoutId = setTimeout(reveal, VIDEO_READY_TIMEOUT_MS);

      videos.forEach((video) => {
        const markDone = () => {
          pending.delete(video);
          if (pending.size === 0) {
            clearTimeout(timeoutId);
            reveal();
          }
        };
        // readyState >= 2(HAVE_CURRENT_DATA)면 이미 그릴 수 있는 프레임이 있는 상태.
        if (video.readyState >= 2) {
          markDone();
        } else {
          video.addEventListener("playing", markDone, { once: true });
          video.addEventListener("loadeddata", markDone, { once: true });
        }
      });
    }

    function handleWindowLoad() {
      waitForVideos();
    }

    if (document.readyState === "complete") {
      waitForVideos();
    } else {
      window.addEventListener("load", handleWindowLoad);
    }

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("load", handleWindowLoad);
    };
  }, []);

  return (
    <>
      {!ready && <LoadingScreen />}
      {/* body(min-h-full flex flex-col)의 flex 체인이 여기서 끊기지 않게 해야
          각 페이지의 <main className="flex-1">가 실제로 늘어나 푸터를 화면 하단에
          붙인다(콘텐츠가 뷰포트보다 길면 자연스럽게 콘텐츠 아래로 밀려난다). */}
      <div className={`flex min-h-full flex-1 flex-col ${ready ? "" : "invisible"}`}>
        {children}
      </div>
    </>
  );
}
