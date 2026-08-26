import { TrashSection } from "@/components/admin/trash-section";
import {
  permanentlyDeleteGuestbookEntry,
  restoreGuestbookEntry,
} from "@/app/admin/(protected)/guestbook/actions";
import { permanentlyDeleteProject, restoreProject } from "@/app/admin/(protected)/works/actions";
import { permanentlyDeleteStudy, restoreStudy } from "@/app/admin/(protected)/studies/actions";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTrashPage() {
  const supabase = await createClient();

  const [projects, studies, guestbook] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase
      .from("studies")
      .select("id, title, deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase
      .from("guestbook")
      .select("id, nickname, content, deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">휴지통</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          삭제한 항목을 30일 정도 보관해요. 자동 영구 삭제 기능은 아직 없으니, 필요 없어진 항목은
          여기서 직접 완전 삭제해 주세요.
        </p>
      </div>

      <TrashSection
        title="Works"
        emptyText="삭제된 프로젝트가 없어요."
        items={(projects.data ?? []).map((p) => ({
          id: p.id,
          label: p.title,
          deletedAt: p.deleted_at as string,
        }))}
        onRestore={restoreProject}
        onPermanentDelete={permanentlyDeleteProject}
      />

      <TrashSection
        title="Study"
        emptyText="삭제된 스터디가 없어요."
        items={(studies.data ?? []).map((s) => ({
          id: s.id,
          label: s.title,
          deletedAt: s.deleted_at as string,
        }))}
        onRestore={restoreStudy}
        onPermanentDelete={permanentlyDeleteStudy}
      />

      <TrashSection
        title="방명록"
        emptyText="삭제된 방명록 글이 없어요."
        items={(guestbook.data ?? []).map((g) => ({
          id: g.id,
          label: `${g.nickname} · ${g.content.slice(0, 40)}${g.content.length > 40 ? "…" : ""}`,
          deletedAt: g.deleted_at as string,
        }))}
        onRestore={restoreGuestbookEntry}
        onPermanentDelete={permanentlyDeleteGuestbookEntry}
      />
    </div>
  );
}
