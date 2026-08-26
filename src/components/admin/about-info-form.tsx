"use client";

import { useState, useTransition } from "react";
import { updateAbout } from "@/app/admin/(protected)/about/actions";
import { FormSection, TextAreaField, TextField } from "@/components/admin/admin-form-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { About } from "@/lib/types";

const EMPTY: About = {
  photo_url: null,
  name_ko: null,
  name_en: null,
  tagline: null,
  cover_letter: null,
  cover_letter_summary: null,
  email: null,
  instagram_url: null,
  resume_url: null,
};

export function AboutInfoForm({ about }: { about: About | null }) {
  const [input, setInput] = useState<About>(about ?? EMPTY);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function set<K extends keyof About>(key: K, value: About[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateAbout(input);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <FormSection title="자기소개">
      <div className="sm:col-span-2">
        <ImageUploadField
          label="프로필 사진"
          value={input.photo_url}
          onChange={(url) => set("photo_url", url)}
          pathPrefix="about/photo"
          guide="정사각형에 가까운 비율 권장 · 5MB 이하 · jpg/png/webp"
        />
      </div>
      <TextField label="이름(국문)" value={input.name_ko ?? ""} onChange={(v) => set("name_ko", v || null)} />
      <TextField label="이름(영문)" value={input.name_en ?? ""} onChange={(v) => set("name_en", v || null)} />
      <TextField
        label="한 줄 소개"
        value={input.tagline ?? ""}
        onChange={(v) => set("tagline", v || null)}
      />
      <TextField
        label="이메일"
        type="email"
        value={input.email ?? ""}
        onChange={(v) => set("email", v || null)}
      />
      <TextField
        label="인스타그램 URL"
        value={input.instagram_url ?? ""}
        onChange={(v) => set("instagram_url", v || null)}
      />
      <TextField
        label="이력서 URL"
        value={input.resume_url ?? ""}
        onChange={(v) => set("resume_url", v || null)}
      />
      <div className="sm:col-span-2">
        <TextAreaField
          label="Cover letter 요약"
          hint="Main 페이지 About 요약에 노출"
          rows={3}
          value={input.cover_letter_summary ?? ""}
          onChange={(v) => set("cover_letter_summary", v || null)}
        />
      </div>
      <div className="sm:col-span-2">
        <TextAreaField
          label="Cover letter 전문"
          hint="/about 페이지에 전문 노출"
          rows={10}
          value={input.cover_letter ?? ""}
          onChange={(v) => set("cover_letter", v || null)}
        />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 text-[13px] font-semibold text-[var(--color-accent-ink)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
        {error && <p className="text-[12px] text-red-600">{error}</p>}
        {!error && savedAt && (
          <p className="text-[12px] text-[var(--color-text-muted)]">저장됨 · {savedAt.toLocaleTimeString("ko-KR")}</p>
        )}
      </div>
    </FormSection>
  );
}
