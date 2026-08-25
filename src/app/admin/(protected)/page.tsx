import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/admin/stat-tile";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: unreadCount },
    { count: holdCount },
    { count: totalCount },
    { count: draftWorksCount },
    { count: draftStudiesCount },
    { count: featuredProfessionalCount },
    { count: featuredSideCount },
    { count: featuredStudiesCount },
  ] = await Promise.all([
    supabase
      .from("guestbook")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false)
      .is("deleted_at", null),
    supabase
      .from("guestbook")
      .select("id", { count: "exact", head: true })
      .eq("flag", "hold")
      .is("deleted_at", null),
    supabase.from("guestbook").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft")
      .is("deleted_at", null),
    supabase
      .from("studies")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft")
      .is("deleted_at", null),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category", "professional")
      .eq("is_featured", true),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("category", "side")
      .eq("is_featured", true),
    supabase.from("studies").select("id", { count: "exact", head: true }).eq("is_featured", true),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">대시보드</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">사이트 현황을 한눈에 확인하세요.</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold text-[var(--color-text-muted)]">방명록</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="미확인 방명록" value={unreadCount ?? 0} tone={unreadCount ? "accent" : "neutral"} />
          <StatTile label="검토 대기(보류)" value={holdCount ?? 0} tone={holdCount ? "warn" : "neutral"} />
          <StatTile label="전체 게시글" value={totalCount ?? 0} />
        </div>
        <Link
          href="/admin/guestbook"
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-[14px] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02]"
        >
          방명록 관리로 이동
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold text-[var(--color-text-muted)]">콘텐츠</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatTile label="Draft 프로젝트" value={draftWorksCount ?? 0} />
          <StatTile label="Draft 스터디" value={draftStudiesCount ?? 0} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Professional 노출" value={`${featuredProfessionalCount ?? 0} / 5`} />
          <StatTile label="Side 노출" value={`${featuredSideCount ?? 0} / 2`} />
          <StatTile label="Study 노출" value={`${featuredStudiesCount ?? 0} / 4`} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/works"
            className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-line)] px-4 text-[13px] font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Works 관리
          </Link>
          <Link
            href="/admin/studies"
            className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-line)] px-4 text-[13px] font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Study 관리
          </Link>
          <Link
            href="/admin/main"
            className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-line)] px-4 text-[13px] font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            노출 관리
          </Link>
        </div>
      </div>
    </div>
  );
}
