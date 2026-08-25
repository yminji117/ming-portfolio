import { createClient } from "@/lib/supabase/client";

// storage.buckets의 file_size_limit/allowed_mime_types(0031_admin_media_storage.sql,
// 0033_admin_media_size_limit.sql)와 같은 값 — 서버(버킷 정책)가 최종 방어선이고,
// 여기서는 업로드 전에 미리 걸러 빠른 피드백을 준다.
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export type UploadImageResult = { ok: true; url: string } | { ok: false; message: string };

export async function uploadImage(file: File, pathPrefix: string): Promise<UploadImageResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, message: "JPG, PNG, WebP 파일만 업로드할 수 있어요." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "파일 용량은 20MB를 넘을 수 없어요." };
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("uploadImage failed:", error.message);
    // Storage 에러 메시지는 대부분 그대로 보여줘도 되는 수준이라(버킷 없음, 권한 없음 등)
    // 원인을 바로 알 수 있도록 감추지 않고 노출한다.
    return { ok: false, message: `업로드에 실패했어요: ${error.message}` };
  }

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
