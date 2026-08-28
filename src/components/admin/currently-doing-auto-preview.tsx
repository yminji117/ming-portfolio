import { LABEL_STYLE, LABEL_TEXT } from "@/components/currently-row";
import { formatCurrentlyRange } from "@/lib/format";
import type { CurrentlyDoing } from "@/lib/types";

const CATEGORY_TEXT: Record<CurrentlyDoing["category"], string> = {
  works: "Works",
  side: "Side",
  study: "Study",
};

// Works(Professional/Side)·Study에 등록된 게시 항목이 자동으로 채워 넣는 목록 — 읽기 전용.
// 수정/삭제는 각 콘텐츠(/admin/works, /admin/studies)에서 하고, 여기서는 미리보기만 제공한다.
export function CurrentlyDoingAutoPreview({ items }: { items: CurrentlyDoing[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[var(--color-line)] bg-white p-5">
      <div>
        <h2 className="text-[14px] font-bold text-[var(--color-text)]">자동 생성 목록</h2>
        <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
          Works(Professional/Side)·Study에 게시된 항목이 자동으로 채워집니다. 위 목록에서 특정
          프로젝트/스터디를 &ldquo;연결&rdquo;해두면 여기서는 제외돼요. 수정·숨김·삭제는
          /admin/works, /admin/studies에서 해주세요.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-[var(--color-line)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
          자동으로 채울 항목이 없어요.
        </p>
      ) : (
        <div className="divide-y divide-[var(--color-line)]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="w-14 text-[12px] uppercase text-[var(--color-text-muted)]">
                  {CATEGORY_TEXT[item.category]}
                </span>
                <span
                  className={`inline-flex w-[54px] items-center justify-center rounded-[4px] px-2 py-1 text-[12px] ${LABEL_STYLE[item.label]}`}
                >
                  {LABEL_TEXT[item.label]}
                </span>
                <span className="text-[13px] font-medium text-[var(--color-text)]">{item.title}</span>
              </div>
              <span className="text-[12px] text-[var(--color-text-muted)]">
                {formatCurrentlyRange(item.start_date, item.end_date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
