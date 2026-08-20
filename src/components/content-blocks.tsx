import Image from "next/image";
import type { ContentBlock } from "@/lib/types";

function isYoutubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

function toYoutubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname.includes("youtu.be")
      ? parsed.pathname.slice(1)
      : parsed.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

// PRD 6.2 본문 블록: 텍스트/이미지 1장/이미지 2열/영상(mp4·YouTube)/인용/구분선/캡션
export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "text":
            return (
              <p key={i} className="whitespace-pre-line text-[length:var(--fs-body)] leading-relaxed">
                {block.text}
              </p>
            );
          case "image":
            return (
              <div key={i} className="relative aspect-video overflow-hidden rounded-[var(--radius)]">
                <Image
                  src={block.url}
                  alt={block.alt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="object-cover"
                />
              </div>
            );
          case "image_pair":
            return (
              <div key={i} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {block.urls.map((url) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-[var(--radius)]">
                    <Image
                      src={url}
                      alt={block.alt ?? ""}
                      fill
                      sizes="(min-width: 1024px) 400px, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            );
          case "video":
            return (
              <div key={i} className="relative aspect-video overflow-hidden rounded-[var(--radius)] bg-black">
                {isYoutubeUrl(block.url) ? (
                  <iframe
                    src={toYoutubeEmbedUrl(block.url)}
                    title="video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                ) : (
                  <video src={block.url} controls playsInline className="h-full w-full object-cover" />
                )}
              </div>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 border-[var(--color-accent)] pl-6 text-[length:var(--fs-body)] italic text-[var(--color-text-muted)]"
              >
                {block.text}
              </blockquote>
            );
          case "divider":
            return <hr key={i} className="border-[var(--color-line)]" />;
          case "caption":
            return (
              <p key={i} className="text-center text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                {block.text}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
