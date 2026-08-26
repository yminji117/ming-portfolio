"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createStudy,
  deleteStudy,
  updateStudy,
  type StudyInput,
} from "@/app/admin/(protected)/studies/actions";
import { setFeaturedPosition, unfeatureItem } from "@/app/admin/(protected)/main/actions";
import {
  CheckboxField,
  DateRangeField,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/admin-form-field";
import { ContentBlockEditor } from "@/components/admin/content-block-editor";
import { FeaturedControl } from "@/components/admin/featured-control";
import { GalleryUploadField } from "@/components/admin/gallery-upload-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { StudyCategoryField } from "@/components/admin/study-category-field";
import { StudyFormatField } from "@/components/admin/study-format-field";
import { StudyStepsEditor } from "@/components/admin/study-steps-editor";
import { cleanContentBlocks } from "@/lib/clean-content-blocks";
import { FEATURED_CAP_STUDY } from "@/lib/featured-caps";
import { slugify } from "@/lib/slugify";
import type { ContentStatus, Study } from "@/lib/types";

function toInput(study?: Study): StudyInput {
  return {
    slug: study?.slug ?? "",
    title: study?.title ?? "",
    org_name: study?.org_name ?? null,
    summary: study?.summary ?? null,
    overview: study?.overview ?? null,
    thumbnail_url: study?.thumbnail_url ?? null,
    main_thumbnail_url: study?.main_thumbnail_url ?? null,
    tags: study?.tags ?? [],
    external_url: study?.external_url ?? null,
    related_url: study?.related_url ?? null,
    start_date: study?.start_date ?? null,
    end_date: study?.end_date ?? null,
    body: study?.body ?? { steps: [], blocks: [] },
    gallery_urls: study?.gallery_urls ?? null,
    is_pinned: study?.is_pinned ?? false,
    status: study?.status ?? "draft",
  };
}

export function StudyForm({
  study,
  featuredCount,
  categoryOptions,
}: {
  study?: Study;
  // 자기 자신을 제외한, 이미 노출 중인 스터디 건수.
  featuredCount: number;
  // 다른 스터디에서 이미 "+ 직접 입력"으로 쓰인 카테고리 값 — 선택지로 재사용.
  categoryOptions: string[];
}) {
  const router = useRouter();
  const isEdit = Boolean(study);
  const [input, setInput] = useState<StudyInput>(() => toInput(study));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [wantFeatured, setWantFeatured] = useState(study?.is_featured ?? false);
  const [positionChoice, setPositionChoice] = useState(study?.featured_order ?? 1);
  const [isOngoing, setIsOngoing] = useState(Boolean(study?.start_date && !study?.end_date));
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof StudyInput>(key: K, value: StudyInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const draftBlocksFeature = input.status !== "published";

  async function syncFeatured(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
    const wasFeatured = study?.is_featured ?? false;
    if (wantFeatured && !draftBlocksFeature) {
      if (wasFeatured && study?.featured_order === positionChoice) return { ok: true };
      return setFeaturedPosition("studies", id, positionChoice);
    }
    if (wasFeatured) {
      return unfeatureItem("studies", id);
    }
    return { ok: true };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    // 로드맵 단계(text 미입력)와 본문 블록(텍스트/URL 미입력)은 저장 시 걷어낸다 —
    // 작성한 게 하나도 없으면 Front에서 해당 섹션 자체가 노출되지 않는다.
    const payload: StudyInput = {
      ...input,
      body: {
        steps: (input.body?.steps ?? []).filter((step) => step.text.trim().length > 0),
        blocks: cleanContentBlocks(input.body?.blocks ?? []),
      },
      end_date: isOngoing ? null : input.end_date,
    };

    startTransition(async () => {
      if (isEdit) {
        const result = await updateStudy(study!.id, payload);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        const featuredResult = await syncFeatured(study!.id);
        if (!featuredResult.ok) {
          setError(featuredResult.message);
          return;
        }
        setSavedAt(new Date());
        return;
      }

      const result = await createStudy(payload);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const featuredResult = await syncFeatured(result.id!);
      if (!featuredResult.ok) {
        setError(`등록은 완료됐지만 메인 노출 설정엔 실패했어요: ${featuredResult.message}`);
      }
      router.push(`/admin/studies/${result.id}`);
    });
  }

  function handleDelete() {
    if (!study) return;
    if (!window.confirm(`"${study.title}"을(를) 삭제할까요? 목록·메인에서 즉시 사라져요.`)) return;
    startTransition(async () => {
      const result = await deleteStudy(study.id);
      if (result.ok) router.push("/admin/studies");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24">
      <FormSection title="기본 정보">
        <TextField label="제목" required value={input.title} onChange={(v) => set("title", v)} />
        <TextField
          label="모임 이름"
          hint="/study 리스트 카드 라벨과 타이틀 사이에 노출돼요"
          value={input.org_name ?? ""}
          onChange={(v) => set("org_name", v || null)}
        />
        <div className="flex flex-col gap-1.5">
          <TextField
            label="Slug"
            hint="URL에 쓰여요"
            required
            value={input.slug}
            onChange={(v) => {
              setSlugTouched(true);
              set("slug", v);
            }}
          />
          {!slugTouched && input.title && (
            <button
              type="button"
              onClick={() => set("slug", slugify(input.title))}
              className="self-start text-[12px] text-[var(--color-accent)] hover:underline"
            >
              제목에서 자동 생성
            </button>
          )}
        </div>
        <DateRangeField
          label="기간"
          startValue={input.start_date ?? ""}
          endValue={input.end_date ?? ""}
          ongoing={isOngoing}
          onStartChange={(v) => set("start_date", v || null)}
          onEndChange={(v) => set("end_date", v || null)}
          onOngoingChange={(checked) => {
            setIsOngoing(checked);
            if (checked) set("end_date", null);
          }}
        />
        <SelectField<ContentStatus>
          label="상태"
          value={input.status}
          onChange={(v) => set("status", v)}
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ]}
        />
        <CheckboxField
          label="목록 상단 고정"
          checked={input.is_pinned}
          onChange={(v) => set("is_pinned", v)}
        />
        <div className="sm:col-span-2">
          <TextAreaField
            label="요약"
            hint="/study 리스트 카드 한 줄 요약"
            value={input.summary ?? ""}
            onChange={(v) => set("summary", v || null)}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            label="설명"
            hint="상세 페이지에 노출되는 설명"
            rows={4}
            value={input.overview ?? ""}
            onChange={(v) => set("overview", v || null)}
          />
        </div>
        <StudyCategoryField
          values={input.tags}
          extraOptions={categoryOptions}
          onChange={(v) => set("tags", v)}
        />
        <StudyFormatField values={input.tags} onChange={(v) => set("tags", v)} />
        <TextField
          label="외부 링크"
          hint="채워두면 상세 페이지 대신 원문으로 바로 연결돼요"
          value={input.external_url ?? ""}
          onChange={(v) => set("external_url", v || null)}
        />
        <TextField
          label="관련 URL"
          hint="상세 페이지 설명 하단에 '관련 URL · 바로 가기' 버튼으로 노출돼요 (목록/메인 이동에는 영향 없음)"
          value={input.related_url ?? ""}
          onChange={(v) => set("related_url", v || null)}
        />
      </FormSection>

      <FormSection title="메인 노출">
        <div className="sm:col-span-2">
          <FeaturedControl
            featured={wantFeatured}
            onFeaturedChange={setWantFeatured}
            position={positionChoice}
            onPositionChange={setPositionChoice}
            cap={FEATURED_CAP_STUDY}
            otherCount={featuredCount}
            disabledReason={
              draftBlocksFeature ? "Draft 상태는 노출할 수 없어요. 먼저 상태를 Published로 바꿔주세요." : undefined
            }
          />
        </div>
      </FormSection>

      <FormSection title="로드맵 단계 (선택)">
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <span className="text-[12px] text-[var(--color-text-muted)]">
            단계를 하나라도 넣으면 로드맵 카드로, 비워두면 플랫 카드로 노출돼요.
          </span>
          <StudyStepsEditor
            steps={input.body?.steps ?? []}
            onChange={(steps) => set("body", { ...input.body, steps })}
          />
        </div>
      </FormSection>

      <FormSection title="상세 본문 블록 (선택)">
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <ContentBlockEditor
            blocks={input.body?.blocks ?? []}
            onChange={(blocks) => set("body", { ...input.body, blocks })}
          />
        </div>
      </FormSection>

      <FormSection title="미디어">
        <ImageUploadField
          label="리스트 썸네일"
          value={input.thumbnail_url}
          onChange={(v) => set("thumbnail_url", v)}
          pathPrefix="studies/thumbnail"
          guide="Front /study 리스트 카드 전용 · 권장 비율 16:9(예: 800×450px 이상) · JPG/PNG/WebP · 20MB 이하(실제로는 1~2MB 내외 권장)"
        />
        <ImageUploadField
          label="메인 노출 썸네일"
          value={input.main_thumbnail_url}
          onChange={(v) => set("main_thumbnail_url", v)}
          pathPrefix="studies/main-thumbnail"
          guide="Front 메인 화면 Study 영역 전용 · 권장 비율 16:9(예: 800×450px 이상) · JPG/PNG/WebP · 20MB 이하"
        />
        <div className="sm:col-span-2">
          <GalleryUploadField
            label="갤러리"
            values={input.gallery_urls ?? []}
            onChange={(v) => set("gallery_urls", v)}
            pathPrefix="studies/gallery"
            guide="권장 비율 16:9(예: 1200×675px 이상) · JPG/PNG/WebP · 장당 20MB 이하(1~2MB 내외 권장) · 여러 장 한 번에 선택 가능"
          />
        </div>
      </FormSection>

      {error && (
        <p className="rounded-[10px] bg-red-50 px-4 py-2.5 text-[13px] text-red-600">{error}</p>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 text-[14px] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
          >
            {isPending ? "저장 중..." : isEdit ? "저장" : "등록"}
          </button>
          {savedAt && (
            <span className="text-[12px] text-[var(--color-text-muted)]">
              {savedAt.toLocaleTimeString("ko-KR")} 저장됨
            </span>
          )}
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-[13px] font-medium text-red-600 hover:underline"
          >
            삭제
          </button>
        )}
      </div>
    </form>
  );
}
