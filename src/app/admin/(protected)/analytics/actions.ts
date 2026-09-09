"use server";

import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { getVisitorHash } from "@/lib/analytics-track";

export type ExcludeIpState = { ok: boolean; message: string };

// 아는 IP를 직접 입력해 통계에서 제외 — 추적과 동일한 sha256(ip)로 해시해 넣으므로 그 IP에서
// 온 방문과 정확히 매칭된다. 기존 RPC(analytics_exclude_current_visitor)를 재사용해 과거 기록
// 삭제 + 이후 집계 제외까지 한 번에 처리한다. useActionState 시그니처.
export async function excludeVisitorByIp(
  _prev: ExcludeIpState,
  formData: FormData,
): Promise<ExcludeIpState> {
  const ip = (formData.get("ip") as string | null)?.trim() ?? "";
  if (isIP(ip) === 0) {
    return { ok: false, message: "유효하지 않은 IP 주소예요." };
  }
  const supabase = await requireAdmin();
  const hash = createHash("sha256").update(ip).digest("hex");
  const { error } = await supabase.rpc("analytics_exclude_current_visitor", {
    p_note: ip, // 목록에서 어떤 IP인지 알아보게 IP를 메모로 저장(어드민 전용)
    p_visitor_hash: hash,
  });
  if (error) {
    console.error("excludeVisitorByIp failed:", error.message);
    return { ok: false, message: "추가에 실패했어요. 다시 시도해 주세요." };
  }
  revalidatePath("/admin/analytics");
  return { ok: true, message: `${ip}를 제외 목록에 추가했어요.` };
}

// 현재 접속 IP를 통계에서 제외 — 추적과 동일한 헬퍼로 실제 브라우저 IP 해시를 계산해
// 넘긴다(같은 IP → 같은 해시라야 제외가 실제로 매칭된다). 과거 데이터는 남겨두기로 했으므로
// 이후 방문부터 이 해시가 집계에서 빠진다.
export async function excludeCurrentVisitor(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  const note = (formData.get("note") as string | null)?.trim() || null;
  const visitorHash = await getVisitorHash();
  const { error } = await supabase.rpc("analytics_exclude_current_visitor", {
    p_note: note,
    p_visitor_hash: visitorHash,
  });
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
