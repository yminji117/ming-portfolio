"use client";

import { useState } from "react";
import Image from "next/image";
import { FieldLabel } from "@/components/admin/admin-form-field";
import { uploadImage } from "@/lib/upload-image";

export function GalleryUploadField({
  label,
  values,
  onChange,
  pathPrefix,
  guide,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  pathPrefix: string;
  guide: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: File[]) {
    setError(null);
    setIsUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const result = await uploadImage(file, pathPrefix);
      if (!result.ok) {
        setError(result.message);
        continue;
      }
      uploaded.push(result.url);
    }
    setIsUploading(false);
    if (uploaded.length) onChange([...values, ...uploaded]);
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2.5">
        {values.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative h-20 w-32 shrink-0 overflow-hidden rounded-[10px] border border-[var(--color-line)]"
          >
            <Image src={url} alt="" fill sizes="128px" className="object-cover" />
            <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/60 px-1 text-[10px] tabular-nums text-white">
              {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] text-white hover:bg-black/80"
              aria-label="이미지 삭제"
            >
              ×
            </button>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white hover:bg-white/20 disabled:opacity-30"
                aria-label="앞으로 이동"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === values.length - 1}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white hover:bg-white/20 disabled:opacity-30"
                aria-label="뒤로 이동"
              >
                ›
              </button>
            </div>
          </div>
        ))}
        <label
          className={`flex h-20 w-32 shrink-0 flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-[var(--color-line)] text-[11px] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] ${isUploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
        >
          {isUploading ? "업로드 중..." : "+ 추가"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length) handleFiles(files);
            }}
          />
        </label>
      </div>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      <p className="text-[11px] text-[var(--color-text-muted)]">{guide}</p>
    </div>
  );
}
