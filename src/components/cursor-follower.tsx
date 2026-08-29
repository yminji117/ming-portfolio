"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { Lottie } from "lottie-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import tapAnimation from "@/lottie/tap-tap.json";

// 커서를 바짝 뒤따라오되 뚝뚝 끊기지 않고 부드럽게 이어지도록 스프링을 튜닝한다.
const SPRING = { stiffness: 140, damping: 20, mass: 0.6 };
const SCALE_SPRING = { stiffness: 300, damping: 25 };

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, summary, label, [data-cursor-hover]';

interface Tap {
  id: number;
  x: number;
  y: number;
}

export function CursorFollower() {
  const pathname = usePathname();
  // 어드민(CMS)에서는 커서 팔로워를 띄우지 않는다 — Front 전용 연출.
  const isAdmin = pathname.startsWith("/admin");
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [taps, setTaps] = useState<Tap[]>([]);
  const tapIdRef = useRef(0);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const x = useSpring(cursorX, SPRING);
  const y = useSpring(cursorY, SPRING);
  const active = enabled && !isAdmin;

  useEffect(() => {
    // 터치 기기(정밀 포인터가 없는 환경)에서는 커서 팔로워를 띄우지 않는다.
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(mql.matches);
    function onChange(e: MediaQueryListEvent) {
      setEnabled(e.matches);
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // prefers-reduced-motion 접근성 가드 — Lottie는 MotionConfig의 클램프가
    // 적용되지 않으므로 탭 애니메이션 자체를 띄우지 않는다.
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    function onChange(e: MediaQueryListEvent) {
      setReducedMotion(e.matches);
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!active) return;
    function onMouseMove(e: MouseEvent) {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      const target = e.target as Element | null;
      setHovering(!!target?.closest(INTERACTIVE_SELECTOR));
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [active, cursorX, cursorY]);

  useEffect(() => {
    if (!active || reducedMotion) return;
    function onClick(e: MouseEvent) {
      const id = tapIdRef.current++;
      setTaps((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [active, reducedMotion]);

  if (!active) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[100] size-6 rounded-full border border-white/50 bg-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-[2px] backdrop-saturate-150"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: hovering ? 1.8 : 1 }}
        transition={SCALE_SPRING}
      />
      {taps.map((tap) => (
        <motion.div
          key={tap.id}
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-[100] size-20"
          style={{ left: tap.x, top: tap.y, translateX: "-50%", translateY: "-50%" }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Lottie
            src={tapAnimation}
            loop={false}
            autoplay
            subscriptions={{
              complete: () =>
                setTaps((prev) => prev.filter((t) => t.id !== tap.id)),
            }}
          />
        </motion.div>
      ))}
    </>
  );
}
