import type { ContentBlock } from "@/lib/types";

// 완전히 비어있는 블록(텍스트/URL을 하나도 안 채운 채 추가만 해둔 경우)은 저장 시 걸러낸다 —
// 본문을 실제로 작성해야만 Front(ContentBlocks)에 노출되게 하기 위함.
// divider는 원래 내용이 없는 블록이라 항상 유지한다.
export function cleanContentBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((block) => {
    switch (block.type) {
      case "text":
      case "quote":
      case "caption":
        return block.text.trim().length > 0;
      case "image":
        return block.url.trim().length > 0;
      case "image_pair":
        return block.urls[0].trim().length > 0 && block.urls[1].trim().length > 0;
      case "video":
        return block.url.trim().length > 0;
      case "divider":
        return true;
    }
  });
}
