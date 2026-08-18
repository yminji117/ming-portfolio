"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";

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
      {copied &&
        typeof document !== "undefined" &&
        createPortal(<CopyToast />, document.body)}
    </button>
  );
}

function CopyToast() {
  return (
    <AnimatePresence>
      <motion.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-10 left-1/2 z-[100] -translate-x-1/2 whitespace-nowrap rounded-full bg-[rgba(4,4,4,0.7)] px-12 py-3 text-[16px] text-white"
      >
        복사되었습니다.
      </motion.div>
    </AnimatePresence>
  );
}
