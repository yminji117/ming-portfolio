"use client";

import { useEffect, useState } from "react";

export function TopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] shadow-[0_12px_30px_-10px_rgba(1,61,255,0.45)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:scale-[1.05] active:scale-[0.95]"
      aria-label="맨 위로 이동"
    >
      ↑
    </button>
  );
}
