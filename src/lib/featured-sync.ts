import { setFeaturedPosition, unfeatureItem } from "@/app/admin/(protected)/main/actions";

type FeaturedSyncResult = { ok: true } | { ok: false; message: string };

// Works/Study 폼이 저장 직후 "메인 노출" 설정을 반영하는 공용 로직 — 두 폼 모두
// is_featured/featured_order는 콘텐츠 저장과 별도로 이 함수를 통해서만 바뀐다
// (노출 정원 트리거는 /admin/main의 setFeaturedPosition/unfeatureItem을 통해서만 작동).
export async function syncFeaturedItem(
  table: "projects" | "studies",
  id: string,
  current: { wasFeatured: boolean; wasPosition: number | null },
  next: { wantFeatured: boolean; positionChoice: number; draftBlocksFeature: boolean },
): Promise<FeaturedSyncResult> {
  if (next.wantFeatured && !next.draftBlocksFeature) {
    if (current.wasFeatured && current.wasPosition === next.positionChoice) return { ok: true };
    return setFeaturedPosition(table, id, next.positionChoice);
  }
  if (current.wasFeatured) {
    return unfeatureItem(table, id);
  }
  return { ok: true };
}
