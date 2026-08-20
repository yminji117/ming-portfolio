import { formatCurrentlyRange } from "@/lib/format";
import type { CurrentlyDoing } from "@/lib/types";

export const LABEL_TEXT: Record<CurrentlyDoing["label"], string> = {
  want: "대기",
  doing: "진행중",
  done: "완료",
};

export const LABEL_STYLE: Record<CurrentlyDoing["label"], string> = {
  want: "border border-[#e3e4e7] bg-white text-[var(--color-text)]",
  doing: "bg-black text-white",
  done: "bg-[#cbcbcb] text-[#777777]",
};

export function CurrentlyRow({ item }: { item: CurrentlyDoing }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
        <div className="flex items-center justify-between sm:contents">
          <span className="w-20 text-[length:var(--fs-body)] uppercase text-[var(--color-text)]">
            {item.category}
          </span>
          <span
            className={`inline-flex w-[54px] items-center justify-center rounded-[4px] px-2 py-1 text-[length:var(--fs-body)] sm:hidden ${LABEL_STYLE[item.label]}`}
          >
            {LABEL_TEXT[item.label]}
          </span>
        </div>
        <span className="hidden items-center gap-4 sm:flex">
          <span
            className={`inline-flex w-[54px] items-center justify-center rounded-[4px] px-2 py-1 text-[length:var(--fs-body)] ${LABEL_STYLE[item.label]}`}
          >
            {LABEL_TEXT[item.label]}
          </span>
          <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)]">{item.title}</span>
        </span>
        <span className="text-[length:var(--fs-body)] font-bold text-[var(--color-text)] sm:hidden">
          {item.title}
        </span>
      </div>
      <span className="text-[length:var(--fs-body)] text-[#707070] sm:text-[var(--color-text)]">
        {formatCurrentlyRange(item.start_date, item.end_date)}
      </span>
    </div>
  );
}
