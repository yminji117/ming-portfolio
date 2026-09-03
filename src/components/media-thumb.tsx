import Image from "next/image";
import { DEFAULT_THUMBNAIL } from "@/lib/format";

export function MediaThumb({
  src,
  alt,
  className,
  showOverlay = false,
  theme = "light",
  bare = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  showOverlay?: boolean;
  theme?: "light" | "dark";
  bare?: boolean;
}) {
  const placeholderBg = theme === "dark" ? "bg-white/10" : "bg-[var(--color-bg)]";

  const inner = (
    <div className={`relative h-full w-full overflow-hidden rounded-[var(--radius-inner)] ${placeholderBg}`}>
      <Image
        src={src ?? DEFAULT_THUMBNAIL}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-[1.04]"
      />
      {showOverlay && (
        <div className="absolute inset-0 flex items-end bg-black/0 p-6 opacity-0 transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:bg-black/40 group-hover:opacity-100">
          <span className="translate-y-2 text-white transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-y-0">
            VIEW →
          </span>
        </div>
      )}
    </div>
  );

  if (bare) {
    return <div className={className}>{inner}</div>;
  }

  return <div className={`card-shell ${className ?? ""}`}>{inner}</div>;
}
