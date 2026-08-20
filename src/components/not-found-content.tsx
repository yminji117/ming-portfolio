import Link from "next/link";

// PRD 6.2/12.3 — 존재하지 않거나 draft인 slug 접근 시 노출하는 공용 404 콘텐츠.
// Next.js 16 loading.tsx(Suspense) 하위에서 notFound()를 호출하면 스트리밍이 이미 시작된 뒤라
// HTTP 상태는 200으로 남고 <meta name="robots" content="noindex"> 만 자동 삽입된다(공식 문서 권장 동작).
export function NotFoundContent({
  title = "페이지를 찾을 수 없어요",
  description = "요청하신 콘텐츠가 없거나 더 이상 공개되지 않아요.",
  ctaHref,
  ctaLabel,
}: {
  title?: string;
  description?: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="container-app flex flex-col items-center justify-center gap-4 py-32 text-center">
      <p
        className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight"
        style={{ fontSize: "var(--fs-display-xl)" }}
      >
        404
      </p>
      <h1 className="text-[length:var(--fs-display-md)] font-semibold">{title}</h1>
      <p className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">{description}</p>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-accent)] px-8 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02]"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
