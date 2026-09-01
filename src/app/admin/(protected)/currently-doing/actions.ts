"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CurrentlyDoing } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; message: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  return supabase;
}

function revalidateCurrentlyPaths() {
  revalidatePath("/admin/currently-doing");
  revalidatePath("/");
  revalidatePath("/about");
}

// ref_slug는 DB 컬럼이 아니라 조회 시 계산해서 붙이는 표시용 필드라 입력에서 제외한다.
export type CurrentlyDoingInput = Omit<CurrentlyDoing, "id" | "ref_slug">;

export async function createCurrentlyDoing(input: CurrentlyDoingInput): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("currently_doing").insert(input);
  if (error) return { ok: false, message: "등록에 실패했어요. 다시 시도해 주세요." };
  revalidateCurrentlyPaths();
  return { ok: true };
}

export async function updateCurrentlyDoing(
  id: string,
  input: Partial<CurrentlyDoingInput>,
): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("currently_doing").update(input).eq("id", id);
  if (error) return { ok: false, message: "저장에 실패했어요. 다시 시도해 주세요." };
  revalidateCurrentlyPaths();
  return { ok: true };
}

export async function deleteCurrentlyDoing(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("currently_doing").delete().eq("id", id);
  if (error) return { ok: false, message: "삭제에 실패했어요." };
  revalidateCurrentlyPaths();
  return { ok: true };
}

// 화살표로 위/아래 이동하면 화면에 보이는 전체 순서를 그대로 order(0..N)로 저장한다 —
// order가 비어있는 기존 행이 섞여 있어도(부분 swap이 아니라 전체 재부여라) 항상 안전하다.
export async function reorderCurrentlyDoing(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("currently_doing").update({ order: index }).eq("id", id),
    ),
  );
  if (results.some((r) => r.error)) {
    return { ok: false, message: "순서 변경에 실패했어요." };
  }
  revalidateCurrentlyPaths();
  return { ok: true };
}
