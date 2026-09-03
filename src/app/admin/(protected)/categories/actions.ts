"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import type { Category, CategoryScope } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; message: string };
type CreateResult = { ok: true; category: Category } | { ok: false; message: string };

function revalidateCategoryPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/works/new");
  revalidatePath("/admin/studies/new");
  revalidatePath("/");
  revalidatePath("/works", "layout");
  revalidatePath("/study", "layout");
}

function projectCategory(scope: CategoryScope): "professional" | "side" {
  return scope === "work_professional" ? "professional" : "side";
}

export async function createCategory(scope: CategoryScope, name: string): Promise<CreateResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, message: "이름을 입력해 주세요." };

  const supabase = await requireAdmin();
  const { data: existing } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("scope", scope)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (existing?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("categories")
    .insert({ scope, name: trimmed, sort_order: nextOrder })
    .select("*")
    .single();
  if (error || !data) {
    return { ok: false, message: error?.code === "23505" ? "이미 있는 이름이에요." : "추가에 실패했어요." };
  }
  revalidateCategoryPaths();
  return { ok: true, category: data };
}

export async function renameCategory(id: string, name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, message: "이름을 입력해 주세요." };

  const supabase = await requireAdmin();
  const { data: category, error: fetchError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !category) return { ok: false, message: "카테고리를 찾을 수 없어요." };
  if (category.name === trimmed) return { ok: true };

  const { error: renameError } = await supabase
    .from("categories")
    .update({ name: trimmed })
    .eq("id", id);
  if (renameError) {
    return {
      ok: false,
      message: renameError.code === "23505" ? "이미 있는 이름이에요." : "수정에 실패했어요.",
    };
  }

  // 이름 변경은 기존 프로젝트/스터디에 저장된 값에도 그대로 소급 적용한다 —
  // name이 곧 저장값이자 표시 라벨이라 여기서 갈라지면 안 된다.
  if (category.scope === "study") {
    const { data: rows } = await supabase
      .from("studies")
      .select("id, tags")
      .contains("tags", [category.name]);
    await Promise.all(
      (rows ?? []).map((row) =>
        supabase
          .from("studies")
          .update({ tags: row.tags.map((t: string) => (t === category.name ? trimmed : t)) })
          .eq("id", row.id),
      ),
    );
  } else {
    const category_ = projectCategory(category.scope);
    const { data: rows } = await supabase
      .from("projects")
      .select("id, industry")
      .eq("category", category_)
      .contains("industry", [category.name]);
    await Promise.all(
      (rows ?? []).map((row) =>
        supabase
          .from("projects")
          .update({
            industry: (row.industry ?? []).map((v: string) => (v === category.name ? trimmed : v)),
          })
          .eq("id", row.id),
      ),
    );
  }

  revalidateCategoryPaths();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { data: category, error: fetchError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !category) return { ok: false, message: "카테고리를 찾을 수 없어요." };

  const inUseCount =
    category.scope === "study"
      ? await supabase
          .from("studies")
          .select("id", { count: "exact", head: true })
          .contains("tags", [category.name])
          .then((r) => r.count ?? 0)
      : await supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("category", projectCategory(category.scope))
          .contains("industry", [category.name])
          .then((r) => r.count ?? 0);

  if (inUseCount > 0) {
    return {
      ok: false,
      message: `사용 중인 카테고리는 삭제할 수 없어요. (${inUseCount}건에서 사용 중)`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, message: "삭제에 실패했어요." };
  revalidateCategoryPaths();
  return { ok: true };
}

// 화살표로 위/아래 이동하면 화면에 보이는 전체 순서를 그대로 sort_order(0..N)로 저장한다.
export async function reorderCategories(orderedIds: string[]): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from("categories").update({ sort_order: index }).eq("id", id)),
  );
  if (results.some((r) => r.error)) {
    return { ok: false, message: "순서 변경에 실패했어요." };
  }
  revalidateCategoryPaths();
  return { ok: true };
}
