"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// 세션 최초 진입 시 1회 노출하는 공지 팝업(Figma node 438:397). 닫으면(확인/배경/ESC) 세션 플래그를
// 남기고 heroPopupClosed 이벤트를 쏴서 히어로 영상이 그때 재생을 시작하게 한다.
const SEEN_KEY = "noticePopupSeen";

export function NoticePopup({
  enabled,
  emoji,
  title,
  subtitle,
}: {
  enabled: boolean;
  emoji: string;
  title: string;
  subtitle: string;
}) {
  const [open, setOpen] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  // 배경 클릭 + ESC가 겹쳐 두 번 실행되는 것을 막는 가드.
  const closedRef = useRef(false);

  // sessionStorage는 클라이언트에서만 읽을 수 있으므로 마운트 후 판단한다(첫 페인트엔 없다가
  // hydrate 후 표시 → SSR/hydration 불일치 방지).
  useEffect(() => {
    if (!enabled) {
      // 미제공이면 팝업을 띄우지 않되, HeroVideo가 heroPopupClosed를 무한 대기하지 않도록
      // seen 플래그 + 이벤트를 함께 남긴다(HeroVideo effect 실행 순서와 무관하게 재생됨).
      sessionStorage.setItem(SEEN_KEY, "1");
      window.dispatchEvent(new CustomEvent("heroPopupClosed"));
      return;
    }
    if (sessionStorage.getItem(SEEN_KEY) !== "1") setOpen(true);
  }, [enabled]);

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
            className="flex w-full max-w-[424px] flex-col items-center gap-6 rounded-[10px] bg-white px-10 py-9 text-center font-[family-name:var(--font-body)] text-[#0a0a0a]"
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
            <button
              ref={confirmRef}
              type="button"
              onClick={handleClose}
              className="w-full rounded-[4px] border border-[#013dff] bg-[#0a0a0a] px-7 py-3 text-[16px] font-medium text-white"
            >
              확인
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
