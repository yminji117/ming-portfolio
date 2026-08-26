"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; message: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  return supabase;
}

// 히어로/푸터/점검모드가 사이트 전 페이지에 영향을 주므로 넓게 revalidate한다 —
// 어차피 전 라우트가 동적 렌더링이라 캐시 무효화 자체는 필수는 아니지만, 다른
// admin actions(works/studies/about)와 같은 방어적 패턴을 유지한다.
function revalidateSitePaths() {
  revalidatePath("/admin/site-settings");
  revalidatePath("/", "layout");
}

export async function updateSiteSettings(input: SiteSettings): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("site_settings").update(input).eq("id", true);
  if (error) return { ok: false, message: "저장에 실패했어요. 다시 시도해 주세요." };
  revalidateSitePaths();
  return { ok: true };
}
