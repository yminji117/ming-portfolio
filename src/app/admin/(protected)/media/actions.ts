"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; message: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  return supabase;
}

// 여기서 지우면 Storage 파일 자체가 사라진다 — 어디선가 이 URL을 쓰고 있어도(예: 아직
// Works/About 폼에 저장돼 있는 이미지) 그 참조는 그대로 남아 깨진 이미지가 된다. media
// 테이블 없이 Storage를 그대로 진실 공급원으로 쓰는 구조라 사용처 추적은 불가능하다.
export async function deleteMediaFile(path: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.storage.from("media").remove([path]);
  if (error) return { ok: false, message: "삭제에 실패했어요." };
  revalidatePath("/admin/media");
  return { ok: true };
}
