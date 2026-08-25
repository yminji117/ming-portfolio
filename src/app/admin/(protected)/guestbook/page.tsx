import { createClient } from "@/lib/supabase/server";
import { GuestbookAdminTable } from "@/components/admin/guestbook-admin-table";
import type { GuestbookEntryAdmin } from "@/lib/types";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "unread", label: "미확인" },
  { key: "hold", label: "보류" },
  { key: "spam", label: "스팸" },
  { key: "hidden", label: "숨김" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default async function AdminGuestbookPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter = (FILTERS.some((f) => f.key === rawFilter) ? rawFilter : "all") as FilterKey;

  const supabase = await createClient();
  let query = supabase
    .from("guestbook")
    .select(
      "id, nickname, content, created_at, updated_at, is_private, is_read, is_hidden, flag, admin_memo",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter === "unread") query = query.eq("is_read", false);
  if (filter === "hold") query = query.eq("flag", "hold");
  if (filter === "spam") query = query.eq("flag", "spam");
  if (filter === "hidden") query = query.eq("is_hidden", true);

  const { data, error } = await query;
  if (error) console.error("AdminGuestbookPage query failed:", error.message);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">방명록 관리</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          본문 열람, 숨김/삭제, 운영 메모를 남길 수 있어요.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <a
            key={f.key}
            href={f.key === "all" ? "/admin/guestbook" : `/admin/guestbook?filter=${f.key}`}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              filter === f.key
                ? "bg-[var(--color-text)] text-white"
                : "border border-[var(--color-line)] bg-white text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <GuestbookAdminTable entries={(data as GuestbookEntryAdmin[] | null) ?? []} />
    </div>
  );
}
