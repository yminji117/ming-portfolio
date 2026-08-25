"use client";

import type { ContentBlock } from "@/lib/types";

const BLOCK_LABELS: Record<ContentBlock["type"], string> = {
  text: "텍스트",
  image: "이미지 1장",
  image_pair: "이미지 2장",
  video: "영상",
  quote: "인용",
  divider: "구분선",
  caption: "캡션",
};

const BLOCK_TYPES = Object.keys(BLOCK_LABELS) as ContentBlock["type"][];

function emptyBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "text":
      return { type: "text", text: "" };
    case "image":
      return { type: "image", url: "", alt: "" };
    case "image_pair":
      return { type: "image_pair", urls: ["", ""], alt: "" };
    case "video":
      return { type: "video", url: "" };
    case "quote":
      return { type: "quote", text: "" };
    case "divider":
      return { type: "divider" };
    case "caption":
      return { type: "caption", text: "" };
  }
}

// Project/Study 상세 본문(body) 공용 블록 에디터 — PRD 6.2 7종 블록을 그대로 편집한다.
// 이미지/영상은 아직 업로드 위젯이 없어(Phase 3d) URL 직접 입력 방식.
export function ContentBlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  function update(index: number, block: ContentBlock) {
    onChange(blocks.map((b, i) => (i === index ? block : b)));
  }
  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }
  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-[12px] border border-[var(--color-line)] bg-[#fafbfd] p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[var(--color-text-muted)]">
              {index + 1}. {BLOCK_LABELS[block.type]}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#eceef3] disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
                className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#eceef3] disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="h-7 rounded-full px-2 text-[12px] text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          </div>

          <BlockFields block={block} onChange={(next) => update(index, next)} />
        </div>
      ))}

      <div className="flex flex-wrap gap-1.5">
        {BLOCK_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange([...blocks, emptyBlock(type)])}
            className="rounded-full border border-dashed border-[var(--color-line)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            + {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
}) {
  const textAreaClass =
    "resize-none rounded-[8px] border border-[var(--color-line)] bg-white p-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]";
  const inputClass =
    "h-9 rounded-[8px] border border-[var(--color-line)] bg-white px-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]";

  switch (block.type) {
    case "text":
    case "quote":
    case "caption":
      return (
        <textarea
          value={block.text}
          rows={block.type === "text" ? 4 : 2}
          onChange={(event) => onChange({ ...block, text: event.target.value })}
          placeholder="내용을 입력하세요"
          className={textAreaClass}
        />
      );
    case "image":
      return (
        <div className="flex flex-col gap-2">
          <input
            value={block.url}
            onChange={(event) => onChange({ ...block, url: event.target.value })}
            placeholder="이미지 URL"
            className={inputClass}
          />
          <input
            value={block.alt ?? ""}
            onChange={(event) => onChange({ ...block, alt: event.target.value })}
            placeholder="대체 텍스트(alt, 선택)"
            className={inputClass}
          />
        </div>
      );
    case "image_pair":
      return (
        <div className="flex flex-col gap-2">
          <input
            value={block.urls[0]}
            onChange={(event) => onChange({ ...block, urls: [event.target.value, block.urls[1]] })}
            placeholder="이미지 URL 1"
            className={inputClass}
          />
          <input
            value={block.urls[1]}
            onChange={(event) => onChange({ ...block, urls: [block.urls[0], event.target.value] })}
            placeholder="이미지 URL 2"
            className={inputClass}
          />
          <input
            value={block.alt ?? ""}
            onChange={(event) => onChange({ ...block, alt: event.target.value })}
            placeholder="대체 텍스트(alt, 선택)"
            className={inputClass}
          />
        </div>
      );
    case "video":
      return (
        <input
          value={block.url}
          onChange={(event) => onChange({ ...block, url: event.target.value })}
          placeholder="영상 URL"
          className={inputClass}
        />
      );
    case "divider":
      return <p className="text-[12px] text-[var(--color-text-muted)]">구분선 — 별도 입력 없음</p>;
  }
}
