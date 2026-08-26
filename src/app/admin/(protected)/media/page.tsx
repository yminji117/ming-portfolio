import { MediaLibrary } from "@/components/admin/media-library";
import { listAllMediaFiles } from "@/lib/list-media";

export default async function AdminMediaPage() {
  const files = await listAllMediaFiles();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">미디어 라이브러리</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          Works/About/Site Settings에서 업로드한 이미지 {files.length}개예요.
        </p>
      </div>

      <MediaLibrary files={files} />
    </div>
  );
}
