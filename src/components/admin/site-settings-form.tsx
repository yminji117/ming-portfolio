"use client";

import { useState, useTransition } from "react";
import { updateSiteSettings } from "@/app/admin/(protected)/site-settings/actions";
import {
  CheckboxField,
  FormSection,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/admin-form-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { HeroMediaType, SiteSettings } from "@/lib/types";

const EMPTY: SiteSettings = {
  hero_title: "Welcome To My Home",
  hero_subtitle: null,
  hero_image_url: null,
  hero_video_url: null,
  hero_media_type: "video",
  currently_limit: 6,
  footer_text: null,
  og_image_url: null,
  is_maintenance: false,
  notice_enabled: true,
  notice_emoji: "🚨",
  notice_title: "아직 수정 중으로 서버 오류가 날 수 있어요!",
  notice_subtitle: "오류날 경우 잠시후 새로고침 해주세요.\n감사합니다 :-)",
};

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [input, setInput] = useState<SiteSettings>(settings ?? EMPTY);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateSiteSettings(input);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <FormSection title="히어로">
        <TextField
          label="히어로 타이틀"
          hint="4단어(공백 구분)면 Main 4분할 레이아웃, 그 외엔 한 줄로 노출"
          value={input.hero_title}
          onChange={(v) => set("hero_title", v)}
        />
        <SelectField<HeroMediaType>
          label="미디어 형태"
          value={input.hero_media_type}
          onChange={(v) => set("hero_media_type", v)}
          options={[
            { value: "video", label: "영상" },
            { value: "image", label: "이미지" },
          ]}
        />

        {input.hero_media_type === "image" ? (
          <div className="sm:col-span-2">
            <ImageUploadField
              label="히어로 이미지"
              value={input.hero_image_url}
              onChange={(url) => set("hero_image_url", url)}
              pathPrefix="site/hero"
              guide="767:420 비율 권장 · 5MB 이하 · jpg/png/webp"
            />
          </div>
        ) : (
          <div className="sm:col-span-2">
            <TextField
              label="히어로 영상 URL"
              hint="직접 업로드는 지원하지 않아요 — 외부 호스팅(Supabase Storage 등)에 올린 mp4 링크를 입력"
              value={input.hero_video_url ?? ""}
              onChange={(v) => set("hero_video_url", v || null)}
              placeholder="https://.../hero.mp4"
            />
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              비워두면 기존 기본 영상이 그대로 노출돼요.
            </p>
          </div>
        )}
      </FormSection>

      <FormSection title="기타">
        <NumberField
          label="Currently Doing 최대 노출 개수"
          value={input.currently_limit}
          onChange={(v) => set("currently_limit", v ?? 6)}
          min={1}
        />
        <TextField
          label="푸터 문구"
          hint="비우면 기본 카피라이트 문구 노출"
          value={input.footer_text ?? ""}
          onChange={(v) => set("footer_text", v || null)}
          placeholder="© 2026 MINJI. All rights reserved."
        />
        <div className="sm:col-span-2">
          <ImageUploadField
            label="SEO 대표 이미지(OG)"
            value={input.og_image_url}
            onChange={(url) => set("og_image_url", url)}
            pathPrefix="site/og"
            guide="카카오톡/슬랙 등에 링크 공유 시 노출되는 대표 이미지 · 1200×630 권장"
          />
        </div>
      </FormSection>

      <FormSection title="공지 팝업">
        <div className="sm:col-span-2">
          <CheckboxField
            label="공지 팝업 제공"
            checked={input.notice_enabled}
            onChange={(v) => set("notice_enabled", v)}
          />
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            끄면 방문자에게 팝업이 표시되지 않아요.
          </p>
        </div>
        <TextField
          label="이모지"
          hint="예: 🚨"
          value={input.notice_emoji}
          onChange={(v) => set("notice_emoji", v)}
        />
        <TextField
          label="타이틀"
          value={input.notice_title}
          onChange={(v) => set("notice_title", v)}
        />
        <div className="sm:col-span-2">
          <TextAreaField
            label="서브타이틀"
            hint="줄바꿈(Enter)으로 여러 줄 입력 가능 · 길이에 따라 팝업 높이 자동 조절"
            value={input.notice_subtitle}
            onChange={(v) => set("notice_subtitle", v)}
          />
        </div>
      </FormSection>

      <FormSection title="점검모드">
        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[14px] font-medium text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={input.is_maintenance}
              onChange={(event) => set("is_maintenance", event.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            점검모드 켜기
          </label>
          {input.is_maintenance && (
            <p className="rounded-[10px] bg-red-50 px-3 py-2 text-[12px] text-red-700">
              켜면 /admin을 제외한 전 페이지 방문자에게 점검 안내만 보여요. 확인 후 반드시 꺼주세요.
            </p>
          )}
        </div>
      </FormSection>

      <div className="flex items-center gap-3">
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
          <p className="text-[12px] text-[var(--color-text-muted)]">
            저장됨 · {savedAt.toLocaleTimeString("ko-KR")}
          </p>
        )}
      </div>
    </div>
  );
}
