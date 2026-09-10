"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { NoticeDisplayMode } from "@/lib/types";

// 공지 팝업(Figma node 438:397). 노출 방식은 어드민에서 4가지 중 선택(mode).
// 닫으면(확인/배경/ESC) 세션 플래그를 남기고 heroPopupClosed 이벤트를 쏴서 히어로 영상이
// 그때 재생을 시작하게 한다. 팝업을 아예 안 여는 경우에도 같은 신호(unblockHero)를 흘려
// 히어로 영상이 무한 대기하지 않게 한다.
const SEEN_KEY = "noticePopupSeen";
// "오늘 하루 안보기" 만료 시각(epoch ms) — 세션이 아니라 기기별로 12시간 유지되도록 localStorage.
const DISMISS_KEY = "noticePopupDismissUntil";

export function NoticePopup({
  mode,
  emoji,
  title,
  subtitle,
}: {
  mode: NoticeDisplayMode;
  emoji: string;
  title: string;
  subtitle: string;
}) {
  const [open, setOpen] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  // 배경 클릭 + ESC가 겹쳐 두 번 실행되는 것을 막는 가드.
  const closedRef = useRef(false);

  // sessionStorage/localStorage는 클라이언트에서만 읽을 수 있으므로 마운트 후 판단한다(첫 페인트엔
  // 없다가 hydrate 후 표시 → SSR/hydration 불일치 방지).
  useEffect(() => {
    // 팝업을 안 열 때 히어로 영상이 heroPopupClosed를 무한 대기하지 않도록 seen 플래그 + 이벤트를
    // 함께 남긴다(HeroVideo effect 실행 순서와 무관하게 재생됨).
    const unblockHero = () => {
      sessionStorage.setItem(SEEN_KEY, "1");
      window.dispatchEvent(new CustomEvent("heroPopupClosed"));
    };
    if (mode === "off") return unblockHero();
    if (mode === "once_session") {
      if (sessionStorage.getItem(SEEN_KEY) === "1") return unblockHero();
      return void setOpen(true);
    }
    if (mode === "every_entry") return void setOpen(true);
    // dismiss_12h — 만료 전이면 노출 안 함.
    if (Date.now() < Number(localStorage.getItem(DISMISS_KEY) || 0)) return unblockHero();
    setOpen(true);
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleClose() {
    if (closedRef.current) return;
    closedRef.current = true;
    setOpen(false);
    sessionStorage.setItem(SEEN_KEY, "1");
    window.dispatchEvent(new CustomEvent("heroPopupClosed"));
  }

  // "오늘 하루 안보기" — 지금부터 12시간 미노출로 기록하고 닫는다.
  function handleDismissToday() {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 12 * 60 * 60 * 1000));
    handleClose();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-[424px] flex-col items-center gap-6 rounded-[10px] bg-white px-6 py-8 text-center font-[family-name:var(--font-body)] text-[#0a0a0a] sm:px-10 sm:py-9"
          >
            <div className="flex flex-col items-center gap-2.5">
              <span className="text-[48px] leading-none" aria-hidden="true">
                {emoji}
              </span>
              <p id="notice-title" className="text-[16px] font-bold leading-[29px]">
                {title}
              </p>
              <p className="whitespace-pre-line text-[16px] font-medium leading-[29px]">
                {subtitle}
              </p>
            </div>
            {mode === "dismiss_12h" ? (
              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={handleDismissToday}
                  className="min-w-0 flex-1 basis-0 rounded-[4px] border border-[#0a0a0a] bg-white px-3 py-3 text-[16px] font-medium text-[#0a0a0a]"
                >
                  오늘 하루 안보기
                </button>
                <button
                  ref={confirmRef}
                  type="button"
                  onClick={handleClose}
                  className="min-w-0 flex-1 basis-0 rounded-[4px] border border-[#013dff] bg-[#0a0a0a] px-3 py-3 text-[16px] font-medium text-white"
                >
                  확인
                </button>
              </div>
            ) : (
              <button
                ref={confirmRef}
                type="button"
                onClick={handleClose}
                className="w-full rounded-[4px] border border-[#013dff] bg-[#0a0a0a] px-7 py-3 text-[16px] font-medium text-white"
              >
                확인
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
