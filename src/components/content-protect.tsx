"use client";

import type { ReactNode } from "react";

// Works/Study 상세 페이지 본문 보호 — CSS(user-select/드래그)만으로는 못 막는 복사 이벤트까지
// 잡아준다. 완벽한 복사 방지는 웹에서 불가능하지만(개발자도구 등) 일반적인 드래그 선택·
// 우클릭 복사·이미지 드래그는 막는다.
export function ContentProtect({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`content-protect ${className ?? ""}`}
      onCopy={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      {children}
    </div>
  );
}
