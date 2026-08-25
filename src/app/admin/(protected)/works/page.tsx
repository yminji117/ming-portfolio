import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus, ProjectCategory } from "@/lib/types";

const CATEGORY_TABS: { key: ProjectCategory | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "professional", label: "Professional" },
  { key: "side", label: "Side" },
];

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Draft",
  published: "Published",
};

type Row = {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  status: ContentStatus;
  is_featured: boolean;
  start_date: string | null;
};

export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCategory } = await searchParams;
  const category = CATEGORY_TABS.some((t) => t.key === rawCategory)
    ? (rawCategory as ProjectCategory | "all")
    : "all";

  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("id, slug, title, category, status, is_featured, start_date")
    .is("deleted_at", null)
    .order("start_date", { ascending: false, nullsFirst: false });

  if (category !== "all") query = query.eq("category", category);

  const { data, error } = await query;
  if (error) console.error("AdminWorksPage query failed:", error.message);
  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--color-text)]">Works</h1>
          <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
            Professional·Side 프로젝트를 관리해요. 메인 노출 순서는{" "}
            <Link href="/admin/main" className="text-[var(--color-accent)] hover:underline">
              노출 관리
            </Link>
            에서 설정해요.
          </p>
        </div>
        <Link
          href="/admin/works/new"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 text-[14px] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02]"
        >
          + 새 프로젝트
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => (
          <a
            key={tab.key}
            href={tab.key === "all" ? "/admin/works" : `/admin/works?category=${tab.key}`}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              category === tab.key
                ? "bg-[var(--color-text)] text-white"
                : "border border-[var(--color-line)] bg-white text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[var(--color-line)] bg-white px-6 py-16 text-center text-[14px] text-[var(--color-text-muted)]">
          등록된 프로젝트가 없어요.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/admin/works/${row.id}`}
              className="flex items-center justify-between gap-4 rounded-[14px] border border-[var(--color-line)] bg-white px-5 py-4 transition-colors hover:border-[var(--color-accent)]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-[14px] font-bold text-[var(--color-text)]">{row.title}</span>
                <span className="shrink-0 rounded-full bg-[#eceef3] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                  {row.category === "professional" ? "Professional" : "Side"}
                </span>
                {row.is_featured && (
                  <span className="shrink-0 rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent)]">
                    노출 중
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-[12px] text-[var(--color-text-muted)]">
                <span
                  className={
                    row.status === "published" ? "font-medium text-[var(--color-accent)]" : undefined
                  }
                >
                  {STATUS_LABEL[row.status]}
                </span>
                <span className="tabular-nums">{row.start_date ?? "—"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
