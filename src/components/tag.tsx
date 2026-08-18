import type { ReactNode } from "react";

// Works/Study 카드에 반복 등장하는 태그 pill — role/industry/study 태그 라벨에 공용으로 쓴다.
export function Tag({
  children,
  shape = "pill",
  filled = false,
  className,
}: {
  children: ReactNode;
  shape?: "pill" | "square";
  filled?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center border border-current py-[5px] text-[length:var(--fs-body)] ${
        shape === "pill" ? "rounded-full px-[17px]" : "rounded-[4px] px-[9px]"
      } ${filled ? "bg-white text-[#0a0a0a]" : ""} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
