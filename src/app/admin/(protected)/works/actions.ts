"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; message: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  return supabase;
}

// is_featured/featured_order는 노출 정원 트리거(enforce_featured_cap)가 걸려 있어
// /admin/main에서만 다룬다 — 이 폼은 콘텐츠 필드만 책임진다.
export type ProjectInput = Omit<Project, "id" | "is_featured" | "featured_order" | "deleted_at">;

const SUMMARY_MAX = 50;

// 폼(TextAreaField maxLength)이 1차로 막지만, API를 직접 호출하는 경우까지 대비해
// 저장 직전에 한 번 더 검증한다.
function validateProjectInput(input: ProjectInput): string | null {
  if (input.summary.length > SUMMARY_MAX) {
    return `한 줄 요약은 ${SUMMARY_MAX}자 이하로 입력해주세요.`;
  }
  return null;
}

function friendlyError(message: string): string {
  if (message.includes("duplicate key") && message.includes("slug")) {
    return "이미 사용 중인 slug예요. 다른 값을 입력해주세요.";
  }
  return "저장에 실패했어요. 다시 시도해 주세요.";
}

function revalidateProjectPaths(slug?: string) {
  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath("/");
  if (slug) revalidatePath(`/works/${slug}`);
}

export async function createProject(
  input: ProjectInput,
): Promise<ActionResult & { id?: string }> {
  const validationError = validateProjectInput(input);
  if (validationError) return { ok: false, message: validationError };

  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("projects").insert(input).select("id").single();
  if (error) return { ok: false, message: friendlyError(error.message) };
  revalidateProjectPaths(input.slug);
  return { ok: true, id: data.id };
}

export async function updateProject(id: string, input: ProjectInput): Promise<ActionResult> {
  const validationError = validateProjectInput(input);
  if (validationError) return { ok: false, message: validationError };

  const supabase = await requireAdmin();
  const { error } = await supabase.from("projects").update(input).eq("id", id);
  if (error) return { ok: false, message: friendlyError(error.message) };
  revalidateProjectPaths(input.slug);
  return { ok: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  // is_featured를 그대로 두면 getFeaturedProjects가 deleted_at을 걸러내지 않던 예전 버전에서
  // 삭제된(휴지통에 있는) 프로젝트가 Main에 계속 노출되는 문제가 있었다 — 삭제 시점에 같이 끈다.
  const { error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString(), is_featured: false, featured_order: null })
    .eq("id", id);
  if (error) return { ok: false, message: "삭제에 실패했어요." };
  revalidateProjectPaths();
  return { ok: true };
}

export async function restoreProject(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("projects").update({ deleted_at: null }).eq("id", id);
  if (error) return { ok: false, message: "복구에 실패했어요." };
  revalidateProjectPaths();
  return { ok: true };
}

// 휴지통에서 완전 삭제 — soft delete와 달리 되돌릴 수 없다.
export async function permanentlyDeleteProject(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { ok: false, message: "완전 삭제에 실패했어요." };
  revalidateProjectPaths();
  return { ok: true };
}
