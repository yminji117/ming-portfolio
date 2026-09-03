"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import type { GuestbookFlag } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; message: string };

// proxy/layout의 리다이렉트 가드를 Server Action은 우회할 수 있어(Next.js 공식 문서 권고),
// 실제 쓰기 권한이 걸리는 모든 액션에서 세션을 다시 한번 직접 확인한다.
export async function setGuestbookRead(id: string, isRead: boolean): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("guestbook").update({ is_read: isRead }).eq("id", id);
  if (error) return { ok: false, message: "저장에 실패했어요." };
  revalidatePath("/admin/guestbook");
  return { ok: true };
}

export async function setGuestbookFlag(id: string, flag: GuestbookFlag): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("guestbook").update({ flag }).eq("id", id);
  if (error) return { ok: false, message: "저장에 실패했어요." };
  revalidatePath("/admin/guestbook");
  return { ok: true };
}

export async function setGuestbookHidden(id: string, isHidden: boolean): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("guestbook").update({ is_hidden: isHidden }).eq("id", id);
  if (error) return { ok: false, message: "저장에 실패했어요." };
  revalidatePath("/admin/guestbook");
  revalidatePath("/here");
  return { ok: true };
}

export async function setGuestbookMemo(id: string, memo: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("guestbook")
    .update({ admin_memo: memo || null })
    .eq("id", id);
  if (error) return { ok: false, message: "저장에 실패했어요." };
  revalidatePath("/admin/guestbook");
  return { ok: true };
}

export async function deleteGuestbookEntryAdmin(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("guestbook")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, message: "삭제에 실패했어요." };
  revalidatePath("/admin/guestbook");
  revalidatePath("/here");
  return { ok: true };
}

export async function restoreGuestbookEntry(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("guestbook").update({ deleted_at: null }).eq("id", id);
  if (error) return { ok: false, message: "복구에 실패했어요." };
  revalidatePath("/admin/guestbook");
  revalidatePath("/here");
  return { ok: true };
}

// 휴지통에서 완전 삭제 — soft delete와 달리 되돌릴 수 없다.
export async function permanentlyDeleteGuestbookEntry(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("guestbook").delete().eq("id", id);
  if (error) return { ok: false, message: "완전 삭제에 실패했어요." };
  revalidatePath("/admin/guestbook");
  return { ok: true };
}
