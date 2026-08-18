import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export function MoreLink({
  href,
  className,
  variant = "text",
}: {
  href: string;
  className?: string;
  variant?: "text" | "icon";
}) {
  if (variant === "icon") {
    return (
      <Link
        href={href}
        aria-label="더보기"
        className={`arrow-btn ${className ?? ""}`}
      >
        <ArrowRightIcon className="size-full" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1 text-[length:var(--fs-body)] underline decoration-[var(--color-accent)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)] ${className ?? ""}`}
    >
      더보기
      <span className="inline-block transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
