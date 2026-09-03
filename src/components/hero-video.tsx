"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LoadingScreen } from "@/components/loading-screen";

// 세션당 1회 재생 여부 플래그 — 홈으로 다시 이동해도(같은 세션) 재생하지 않고 고정 프레임만 보여준다.
const PLAYED_KEY = "heroVideoPlayed";
// 공지 팝업을 이미 닫았는지 플래그 / 팝업이 닫혔을 때 오는 이벤트 이름.
// notice-popup.tsx와 값이 반드시 일치해야 한다.
const POPUP_SEEN_KEY = "noticePopupSeen";
const POPUP_CLOSED_EVENT = "heroPopupClosed";

// 히어로 영상은 첫 프레임이 준비되기까지 시간이 걸려, 그 사이 poster(about 사진)가 잠깐
// 노출됐다가 영상으로 바뀌던 문제가 있었다. 준비될 때까지 전체 화면 로딩(LoadingScreen)을
// 덮어두고, 준비되면 걷어내며 영상을 페이드인한다.
// 재생 정책: loop 없이 최초 진입 시 1번만 재생하고 마지막 프레임에서 멈춘다. 같은 세션에
// 다시 진입하면 재생하지 않고 마지막 프레임 고정 상태로 보여준다.
export function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  // 실제로 재생/고정 과정에 들어갔는지 — 팝업 대기 중엔 false로 두어 로딩 화면이 팝업 뒤에서
  // 보이지 않게 한다.
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 데스크톱/모바일 HeroVideo가 둘 다 마운트되므로, 화면에서 숨겨진(display:none) 쪽은
    // 재생/로딩을 하지 않고 즉시 ready 처리한다 — 안 그러면 숨은 영상이 재생되지 못해
    // 포털된 전체 화면 로딩이 폴백(6초)까지 남는다.
    if (video.offsetParent === null) {
      setReady(true);
      return;
    }

    let fallback: number | undefined;
    const done = () => {
      if (fallback) window.clearTimeout(fallback);
      setReady(true);
    };

    // 최초 진입 재생 경로 — loop 없이 muted로 1번 재생하고, 끝나면(ended) 세션 플래그를 남긴다.
    // 느린 네트워크 등으로 로딩이 안 걷힐 때를 대비해 재생 시작 시점에 6초 폴백을 건다.
    const onPlaying = () => done();
    const onEnded = () => sessionStorage.setItem(PLAYED_KEY, "1");
    const startPlayback = () => {
      video.addEventListener("ended", onEnded, { once: true });
      // PageLoadGate가 이미 영상을 버퍼링해둬서 팝업을 닫는 시점엔 대개 재생 준비가 끝나 있다.
      // 이때 로딩을 한 번 더 씌우면 즉시 재생돼 로딩이 찰나에 번쩍이는 깜빡임이 생기므로,
      // 이미 재생 가능(readyState>=3)하면 로딩 없이 바로 재생하고 노출한다.
      if (video.readyState >= 3) {
        video.play().catch(() => {});
        setReady(true);
        return;
      }
      setActivated(true);
      fallback = window.setTimeout(() => setReady(true), 6000);
      video.addEventListener("playing", onPlaying, { once: true });
      video.addEventListener("loadeddata", onPlaying, { once: true }); // playing이 늦게 올 때 대비
      video.play().catch(() => done()); // 자동재생이 막히면 로딩만 걷어낸다
    };

    const alreadyPlayed = sessionStorage.getItem(PLAYED_KEY) === "1";
    const popupSeen = sessionStorage.getItem(POPUP_SEEN_KEY) === "1";

    // 1) 이번 세션에 이미 재생됨 — 재생하지 않고 마지막 프레임으로 이동해 멈춘 상태로 고정.
    if (alreadyPlayed) {
      setActivated(true);
      fallback = window.setTimeout(() => setReady(true), 6000);
      const freeze = () => {
        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = Math.max(0, video.duration - 0.05);
        } else {
          done();
        }
      };
      const onSeeked = () => done();
      video.addEventListener("seeked", onSeeked, { once: true });
      if (video.readyState >= 1) freeze();
      else video.addEventListener("loadedmetadata", freeze, { once: true });
      return () => {
        if (fallback) window.clearTimeout(fallback);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("loadedmetadata", freeze);
      };
    }

    // 2) 아직 미재생 + 팝업을 이미 닫음(같은 세션 재진입 등) — 즉시 재생.
    if (popupSeen) {
      startPlayback();
      return () => {
        if (fallback) window.clearTimeout(fallback);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("loadeddata", onPlaying);
        video.removeEventListener("ended", onEnded);
      };
    }

    // 3) 최초 진입 — 공지 팝업이 닫힐 때까지 재생/로딩을 미룬다.
    const onPopupClosed = () => startPlayback();
    window.addEventListener(POPUP_CLOSED_EVENT, onPopupClosed, { once: true });
    return () => {
      if (fallback) window.clearTimeout(fallback);
      window.removeEventListener(POPUP_CLOSED_EVENT, onPopupClosed);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("loadeddata", onPlaying);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out)] ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* 히어로 섹션의 z-10 스택 컨텍스트를 벗어나 GNB(z-50) 위까지 덮도록 body로 포털한다. */}
      {!ready && activated && createPortal(<LoadingScreen />, document.body)}
    </>
  );
}
