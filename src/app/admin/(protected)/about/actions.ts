"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import type { About, Career, Skill } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; message: string };

function revalidateAboutPaths() {
  revalidatePath("/admin/about");
  revalidatePath("/about");
  revalidatePath("/");
}

export async function updateAbout(input: About): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("about").update(input).eq("id", true);
  if (error) return { ok: false, message: "저장에 실패했어요. 다시 시도해 주세요." };
  revalidateAboutPaths();
  return { ok: true };
}

export type CareerInput = Omit<Career, "id">;

export async function createCareer(input: CareerInput): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("careers").insert(input);
  if (error) return { ok: false, message: "등록에 실패했어요. 다시 시도해 주세요." };
  revalidateAboutPaths();
  return { ok: true };
}

export async function updateCareer(id: string, input: CareerInput): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("careers").update(input).eq("id", id);
  if (error) return { ok: false, message: "저장에 실패했어요. 다시 시도해 주세요." };
  revalidateAboutPaths();
  return { ok: true };
}

export async function deleteCareer(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("careers").delete().eq("id", id);
  if (error) return { ok: false, message: "삭제에 실패했어요." };
  revalidateAboutPaths();
  return { ok: true };
}

export type SkillInput = Omit<Skill, "id">;

export async function createSkill(input: SkillInput): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("skills").insert(input);
  if (error) return { ok: false, message: "등록에 실패했어요. 다시 시도해 주세요." };
  revalidateAboutPaths();
  return { ok: true };
}

export async function updateSkill(id: string, input: SkillInput): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("skills").update(input).eq("id", id);
  if (error) return { ok: false, message: "저장에 실패했어요. 다시 시도해 주세요." };
  revalidateAboutPaths();
  return { ok: true };
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) return { ok: false, message: "삭제에 실패했어요." };
  revalidateAboutPaths();
  return { ok: true };
}

// 같은 group(main/sub) 안에서만 순서를 바꾼다 — SkillsGrid가 group별로 나눠 order순 렌더링한다.
export async function swapSkillOrder(idA: string, idB: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { data, error: fetchError } = await supabase
    .from("skills")
    .select("id, order")
    .in("id", [idA, idB]);
  if (fetchError || !data || data.length !== 2) {
    return { ok: false, message: "순서 변경에 실패했어요." };
  }
  const [a, b] = data;
  const [updateA, updateB] = await Promise.all([
    supabase.from("skills").update({ order: b.order }).eq("id", a.id),
    supabase.from("skills").update({ order: a.order }).eq("id", b.id),
  ]);
  if (updateA.error || updateB.error) {
    return { ok: false, message: "순서 변경에 실패했어요." };
  }
  revalidateAboutPaths();
  return { ok: true };
}
