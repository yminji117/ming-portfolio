import Link from "next/link";
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
  const href =
    item.ref_type === "project" && item.ref_slug
      ? `/works/${item.ref_slug}`
      : item.ref_type === "study" && item.ref_slug
        ? `/study/${item.ref_slug}`
        : null;
  const titleClass = `text-[length:var(--fs-body)] font-bold text-[var(--color-text)] ${
    href ? "transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--color-accent)]" : ""
  }`;

  const body = (
    <>
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
          <span className={titleClass}>{item.title}</span>
        </span>
        <span className={`sm:hidden ${titleClass}`}>{item.title}</span>
      </div>
      <span className="text-[length:var(--fs-body)] text-[#707070] sm:text-[var(--color-text)]">
        {formatCurrentlyRange(item.start_date, item.end_date)}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      {body}
    </div>
  );
}
