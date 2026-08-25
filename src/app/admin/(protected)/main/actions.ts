"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; message: string };
type Table = "projects" | "studies";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  return supabase;
}

// enforce_featured_cap 트리거(0005_industry_and_caps.sql)가 던지는 예외 메시지는
// 이미 사용자에게 보여줘도 되는 한국어 문장이라 그대로 전달한다.
function friendlyError(message: string): string {
  if (message.includes("노출 정원") || message.includes("draft 상태")) return message;
  return "처리에 실패했어요. 다시 시도해 주세요.";
}

function revalidateMainPaths() {
  revalidatePath("/admin/main");
  revalidatePath("/works");
  revalidatePath("/study");
  revalidatePath("/");
}

// 새로 노출하는 항목은 같은 그룹(Project는 category까지)의 마지막 순서로 붙인다.
export async function featureItem(table: Table, id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();

  let category: string | null = null;
  if (table === "projects") {
    const { data: row } = await supabase
      .from("projects")
      .select("category")
      .eq("id", id)
      .maybeSingle();
    category = row?.category ?? null;
  }

  let orderQuery = supabase
    .from(table)
    .select("featured_order")
    .eq("is_featured", true)
    .order("featured_order", { ascending: false })
    .limit(1);
  if (table === "projects" && category) orderQuery = orderQuery.eq("category", category);

  const { data: existing } = await orderQuery;
  const nextOrder = (existing?.[0]?.featured_order ?? 0) + 1;

  const { error } = await supabase
    .from(table)
    .update({ is_featured: true, featured_order: nextOrder })
    .eq("id", id);
  if (error) return { ok: false, message: friendlyError(error.message) };
  revalidateMainPaths();
  return { ok: true };
}

export async function unfeatureItem(table: Table, id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from(table)
    .update({ is_featured: false, featured_order: null })
    .eq("id", id);
  if (error) return { ok: false, message: friendlyError(error.message) };
  revalidateMainPaths();
  return { ok: true };
}

// 원하는 순번(position, 1부터 시작)에 항목을 끼워 넣고 같은 그룹(Project는 category까지) 전체를
// 1..N으로 다시 번호 매긴다 — Works/Study 등록·수정 폼에서 "메인 몇 번째에 노출할지"를 한 번에 반영할 때 쓴다.
export async function setFeaturedPosition(
  table: Table,
  id: string,
  position: number,
): Promise<ActionResult> {
  const supabase = await requireAdmin();

  let category: string | null = null;
  if (table === "projects") {
    const { data: row } = await supabase
      .from("projects")
      .select("category")
      .eq("id", id)
      .maybeSingle();
    category = row?.category ?? null;
  }

  let groupQuery = supabase
    .from(table)
    .select("id, featured_order")
    .eq("is_featured", true)
    .neq("id", id)
    .order("featured_order", { ascending: true });
  if (table === "projects" && category) groupQuery = groupQuery.eq("category", category);

  const { data: othersData, error: fetchError } = await groupQuery;
  if (fetchError) return { ok: false, message: "노출 순서 계산에 실패했어요." };
  const otherIds = (othersData ?? []).map((row) => row.id as string);

  const insertAt = Math.max(0, Math.min(position - 1, otherIds.length));
  const ordered = [...otherIds];
  ordered.splice(insertAt, 0, id);

  // 이 항목을 먼저 is_featured=true로 세팅한다 — 정원/draft 트리거 검증이 여기서 걸린다.
  const { error: featureError } = await supabase
    .from(table)
    .update({ is_featured: true, featured_order: insertAt + 1 })
    .eq("id", id);
  if (featureError) return { ok: false, message: friendlyError(featureError.message) };

  const reorderTargets = ordered
    .map((itemId, index) => ({ itemId, order: index + 1 }))
    .filter(({ itemId }) => itemId !== id);

  for (const { itemId, order } of reorderTargets) {
    const { error } = await supabase.from(table).update({ featured_order: order }).eq("id", itemId);
    if (error) return { ok: false, message: "노출 순서 갱신 중 일부가 실패했어요." };
  }

  revalidateMainPaths();
  return { ok: true };
}

// 두 항목의 featured_order를 맞바꾼다 — 화살표 한 칸 이동.
export async function swapFeaturedOrder(
  table: Table,
  id: string,
  neighborId: string,
): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const [{ data: a }, { data: b }] = await Promise.all([
    supabase.from(table).select("featured_order").eq("id", id).maybeSingle(),
    supabase.from(table).select("featured_order").eq("id", neighborId).maybeSingle(),
  ]);
  if (!a || !b) return { ok: false, message: "순서 변경에 실패했어요." };

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from(table).update({ featured_order: b.featured_order }).eq("id", id),
    supabase.from(table).update({ featured_order: a.featured_order }).eq("id", neighborId),
  ]);
  if (e1 || e2) return { ok: false, message: "순서 변경에 실패했어요." };
  revalidateMainPaths();
  return { ok: true };
}
