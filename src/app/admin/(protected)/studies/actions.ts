"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Study } from "@/lib/types";

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
export type StudyInput = Omit<Study, "id" | "is_featured" | "featured_order">;

// 다른 곳(워드, 노션, PDF 등)에서 복사해 붙여넣으면 스페이스가 눈에 안 보이는
// non-breaking space(U+00A0)로 섞여 들어올 때가 있다 — word-break: keep-all과
// 만나면 그 지점에서 줄바꿈이 안 돼 카드 요약 1번째 줄이 실제보다 일찍 끝나 보인다.
// 저장 시 일반 스페이스로 정규화해 이 문제를 막는다.
function normalizeSpaces(value: string): string {
  return value.replace(/\u00A0/g, " ");
}

function normalizeStudyInput(input: StudyInput): StudyInput {
  return {
    ...input,
    title: normalizeSpaces(input.title),
    summary: input.summary ? normalizeSpaces(input.summary) : input.summary,
  };
}

function friendlyError(message: string): string {
  if (message.includes("duplicate key") && message.includes("slug")) {
    return "이미 사용 중인 slug예요. 다른 값을 입력해주세요.";
  }
  return "저장에 실패했어요. 다시 시도해 주세요.";
}

function revalidateStudyPaths(slug?: string) {
  revalidatePath("/admin/studies");
  revalidatePath("/study");
  revalidatePath("/");
  if (slug) revalidatePath(`/study/${slug}`);
}

export async function createStudy(input: StudyInput): Promise<ActionResult & { id?: string }> {
  const supabase = await requireAdmin();
  const normalized = normalizeStudyInput(input);
  const { data, error } = await supabase.from("studies").insert(normalized).select("id").single();
  if (error) return { ok: false, message: friendlyError(error.message) };
  revalidateStudyPaths(normalized.slug);
  return { ok: true, id: data.id };
}

export async function updateStudy(id: string, input: StudyInput): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const normalized = normalizeStudyInput(input);
  const { error } = await supabase.from("studies").update(normalized).eq("id", id);
  if (error) return { ok: false, message: friendlyError(error.message) };
  revalidateStudyPaths(normalized.slug);
  return { ok: true };
}

export async function deleteStudy(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("studies")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, message: "삭제에 실패했어요." };
  revalidateStudyPaths();
  return { ok: true };
}
