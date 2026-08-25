"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { FieldLabel } from "@/components/admin/admin-form-field";
import { uploadImage } from "@/lib/upload-image";

export function ImageUploadField({
  label,
  value,
  onChange,
  pathPrefix,
  guide,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  pathPrefix: string;
  guide: string;
}) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setIsUploading(true);
    const result = await uploadImage(file, pathPrefix);
    setIsUploading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onChange(result.url);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-[var(--color-line)] bg-[#fafbfd]">
          {value ? (
            <Image
              src={value}
              alt=""
              width={128}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[11px] text-[var(--color-text-muted)]">미리보기</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={inputId}
            className={`inline-flex h-9 w-fit items-center justify-center rounded-full border border-[var(--color-line)] px-4 text-[12px] font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] ${isUploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
          >
            {isUploading ? "업로드 중..." : value ? "다시 업로드" : "이미지 업로드"}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) handleFile(file);
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="w-fit text-[11px] text-red-600 hover:underline"
            >
              제거
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      <p className="text-[11px] text-[var(--color-text-muted)]">{guide}</p>
    </div>
  );
}
