import Image from "next/image";
import type { HeroMediaType } from "@/lib/types";

// site_settings에서 관리하는 히어로 미디어 — 이미지/영상 중 선택, 값이 비어 있으면
// (아직 어드민에서 설정 전) 기존 기본 영상으로 대체해 화면이 비지 않게 한다.
const DEFAULT_VIDEO_URL = "/hero/hi.mp4";

export function HeroMedia({
  mediaType,
  imageUrl,
  videoUrl,
  posterUrl,
  sizes,
}: {
  mediaType: HeroMediaType;
  imageUrl: string | null;
  videoUrl: string | null;
  posterUrl?: string;
  sizes: string;
}) {
  if (mediaType === "image" && imageUrl) {
    return <Image src={imageUrl} alt="" fill priority sizes={sizes} className="object-cover" />;
  }

  return (
    <video
      src={videoUrl ?? DEFAULT_VIDEO_URL}
      poster={posterUrl}
      autoPlay
      muted
      playsInline
      preload="auto"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
