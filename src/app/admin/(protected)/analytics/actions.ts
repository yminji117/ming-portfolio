"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";

// 현재 접속 IP를 통계에서 제외 — 서버가 요청 헤더에서 IP 해시를 계산해 등록하고
// 그 IP의 과거 기록까지 삭제한다(analytics_exclude_current_visitor RPC).
export async function excludeCurrentVisitor(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  const note = (formData.get("note") as string | null)?.trim() || null;
  const { error } = await supabase.rpc("analytics_exclude_current_visitor", { p_note: note });
  if (error) console.error("excludeCurrentVisitor failed:", error.message);
  revalidatePath("/admin/analytics");
}

// 제외 해제 — 이후 새 방문부터 다시 집계된다(이미 지운 과거는 복구되지 않음).
export async function removeExcludedVisitor(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  const hash = formData.get("hash") as string | null;
  if (!hash) return;
  const { error } = await supabase.rpc("analytics_remove_excluded_visitor", { p_hash: hash });
  if (error) console.error("removeExcludedVisitor failed:", error.message);
  revalidatePath("/admin/analytics");
}
