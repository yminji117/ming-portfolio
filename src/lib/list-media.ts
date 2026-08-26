import { createClient } from "@/lib/supabase/server";

export type MediaFile = {
  path: string;
  name: string;
  folder: string;
  url: string;
  size: number | null;
  mimetype: string | null;
  createdAt: string | null;
};

// media 버킷은 별도 DB 테이블 없이 그 자체가 진실 공급원이다 — 업로드가 서버 액션이 아니라
// 브라우저에서 Storage로 바로 올라가서(src/lib/upload-image.ts), DB에 기록하는 곳이 없다.
// 그래서 버킷을 폴더 깊이 상관없이 재귀적으로 순회해 실제 파일 목록을 모은다.
export async function listAllMediaFiles(): Promise<MediaFile[]> {
  const supabase = await createClient();
  const files: MediaFile[] = [];

  async function walk(prefix: string) {
    const { data, error } = await supabase.storage
      .from("media")
      .list(prefix, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error || !data) return;

    for (const entry of data) {
      const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Storage list()는 폴더를 id: null(메타데이터 없음)로 표시한다 — 파일과 구분하는 유일한 방법.
      if (entry.id === null) {
        await walk(fullPath);
        continue;
      }
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(fullPath);
      files.push({
        path: fullPath,
        name: entry.name,
        folder: prefix || "/",
        url: urlData.publicUrl,
        size: entry.metadata?.size ?? null,
        mimetype: entry.metadata?.mimetype ?? null,
        createdAt: entry.created_at ?? null,
      });
    }
  }

  await walk("");
  files.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return files;
}
