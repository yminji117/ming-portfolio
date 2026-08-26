"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { deleteMediaFile } from "@/app/admin/(protected)/media/actions";
import type { MediaFile } from "@/lib/list-media";

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "-";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function MediaLibrary({ files }: { files: MediaFile[] }) {
  const [items, setItems] = useState(files);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, MediaFile[]>();
    items.forEach((file) => {
      const list = map.get(file.folder) ?? [];
      list.push(file);
      map.set(file.folder, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  function handleDelete(file: MediaFile) {
    if (!confirm(`"${file.name}" 파일을 삭제할까요?\n다른 곳에서 이 URL을 쓰고 있다면 이미지가 깨져요.`))
      return;
    setError(null);
    startTransition(async () => {
      const result = await deleteMediaFile(file.path);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setItems((prev) => prev.filter((f) => f.path !== file.path));
    });
  }

  async function handleCopy(file: MediaFile) {
    await navigator.clipboard.writeText(file.url);
    setCopiedPath(file.path);
    setTimeout(() => setCopiedPath((p) => (p === file.path ? null : p)), 1500);
  }

  if (items.length === 0) {
    return (
      <p className="rounded-[16px] border border-dashed border-[var(--color-line)] bg-white px-4 py-10 text-center text-[13px] text-[var(--color-text-muted)]">
        업로드된 이미지가 없어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-[10px] bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
        여기서 삭제하면 Storage 파일이 바로 사라져요. 어떤 콘텐츠에서 쓰이고 있는지는 따로 추적하지
        않으니, 지우기 전에 실제로 안 쓰는 파일인지 확인해 주세요.
      </p>
      {error && <p className="text-[12px] text-red-600">{error}</p>}

      {groups.map(([folder, groupFiles]) => (
        <div key={folder} className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-[var(--color-text)]">
            {folder} <span className="font-normal text-[var(--color-text-muted)]">({groupFiles.length})</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {groupFiles.map((file) => (
              <div
                key={file.path}
                className="flex flex-col gap-2 rounded-[12px] border border-[var(--color-line)] bg-white p-2"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-[8px] bg-[#f3f4f7]">
                  <Image src={file.url} alt="" fill sizes="200px" className="object-cover" />
                </div>
                <div className="flex flex-col gap-0.5 px-0.5">
                  <p className="truncate text-[11px] font-medium text-[var(--color-text)]" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{formatBytes(file.size)}</p>
                </div>
                <div className="flex items-center gap-1.5 px-0.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(file)}
                    className="flex-1 rounded-[6px] border border-[var(--color-line)] py-1 text-[11px] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    {copiedPath === file.path ? "복사됨" : "URL 복사"}
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(file)}
                    className="rounded-[6px] px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
