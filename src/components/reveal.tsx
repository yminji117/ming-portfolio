"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// PRD 2.3 Scroll Reveal — opacity/translateY, stagger 60ms, 1회성.
// reduced-motion 처리는 루트의 MotionConfig(reducedMotion="user")가 전역으로 담당한다.
// 여기서 개별적으로 useReducedMotion()을 읽어 엘리먼트 타입을 분기하면 SSR(항상 false)과
// 클라이언트 값이 달라 하이드레이션 불일치가 나므로 피한다.
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
