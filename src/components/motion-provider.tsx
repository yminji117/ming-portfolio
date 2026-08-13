"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// reducedMotion="user"가 OS의 prefers-reduced-motion을 감지해 모든 모션 컴포넌트의
// 애니메이션을 자동으로 생략한다. 컴포넌트별로 useReducedMotion()을 읽어 분기하면
// SSR(항상 false)과 클라이언트 값이 달라 하이드레이션 불일치가 나므로 여기서 한 번만 처리한다.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
