"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProject,
  deleteProject,
  updateProject,
  type ProjectInput,
} from "@/app/admin/(protected)/works/actions";
import { syncFeaturedItem } from "@/lib/featured-sync";
import {
  CheckboxField,
  DateRangeField,
  FormSection,
  NumberField,
  SelectField,
  TagsField,
  TextAreaField,
  TextField,
} from "@/components/admin/admin-form-field";
import { ContentBlockEditor } from "@/components/admin/content-block-editor";
import { FeaturedControl } from "@/components/admin/featured-control";
import { GalleryUploadField } from "@/components/admin/gallery-upload-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { ChipsMultiSelectField } from "@/components/admin/chips-multi-select-field";
import { cleanContentBlocks } from "@/lib/clean-content-blocks";
import { FEATURED_CAP_PROFESSIONAL, FEATURED_CAP_SIDE } from "@/lib/featured-caps";
import { normalizeIndustry } from "@/lib/format";
import { slugify } from "@/lib/slugify";
import type { ContentStatus, Project, ProjectCategory } from "@/lib/types";

function toInput(project?: Project): ProjectInput {
  return {
    slug: project?.slug ?? "",
    category: project?.category ?? "professional",
    title: project?.title ?? "",
    summary: project?.summary ?? "",
    thumbnail_url: project?.thumbnail_url ?? null,
    cover_url: project?.cover_url ?? null,
    start_date: project?.start_date ?? null,
    end_date: project?.end_date ?? null,
    company: project?.company ?? null,
    role: project?.role ?? [],
    role_note: project?.role_note ?? null,
    tools: project?.tools ?? [],
    team: project?.team ?? null,
    external_url: project?.external_url ?? null,
    overview: project?.overview ?? null,
    main_tasks: project?.main_tasks ?? null,
    result: project?.result ?? null,
    retrospective: project?.retrospective ?? null,
    body: project?.body ?? [],
    gallery_urls: project?.gallery_urls ?? null,
    contribution_percent: project?.contribution_percent ?? null,
    industry: normalizeIndustry(project?.industry),
    is_pinned: project?.is_pinned ?? false,
    status: project?.status ?? "draft",
  };
}

export function ProjectForm({
  project,
  featuredCounts,
  categories,
}: {
  project?: Project;
  // 자기 자신을 제외한, 같은 분류(category)에서 이미 노출 중인 건수.
  featuredCounts: { professional: number; side: number };
  // "카테고리 관리"에서 관리하는 업종 목록 — 순서까지 그대로 선택지에 반영한다.
  categories: { professional: string[]; side: string[] };
}) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [input, setInput] = useState<ProjectInput>(() => toInput(project));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [wantFeatured, setWantFeatured] = useState(project?.is_featured ?? false);
  const [positionChoice, setPositionChoice] = useState(project?.featured_order ?? 1);
  const [isOngoing, setIsOngoing] = useState(Boolean(project?.start_date && !project?.end_date));
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const otherFeaturedCount = featuredCounts[input.category];
  const cap = input.category === "professional" ? FEATURED_CAP_PROFESSIONAL : FEATURED_CAP_SIDE;
  const draftBlocksFeature = input.status !== "published";

  function syncFeatured(id: string) {
    return syncFeaturedItem(
      "projects",
      id,
      { wasFeatured: project?.is_featured ?? false, wasPosition: project?.featured_order ?? null },
      { wantFeatured, positionChoice, draftBlocksFeature },
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    // main_tasks는 "성과"처럼 줄바꿈으로 여러 건을 구분하는 텍스트영역으로 입력받는다 —
    // 편집 중엔 빈 줄도 그대로 두고, 저장 시에만 빈 줄을 걷어내 text[]로 정리한다.
    const cleanedMainTasks = input.main_tasks
      ?.map((task) => task.trim())
      .filter((task) => task.length > 0);
    // 본문 블록도 마찬가지 — 텍스트/URL을 하나도 안 채운 빈 블록은 저장 시 걷어낸다.
    // 작성한 블록이 하나도 없으면 Front(ContentBlocks)에서 이 섹션 자체가 노출되지 않는다.
    const payload: ProjectInput = {
      ...input,
      main_tasks: cleanedMainTasks?.length ? cleanedMainTasks : null,
      body: cleanContentBlocks(input.body ?? []),
      industry: input.industry?.length ? input.industry : null,
      end_date: isOngoing ? null : input.end_date,
    };

    startTransition(async () => {
      if (isEdit) {
        const result = await updateProject(project!.id, payload);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        const featuredResult = await syncFeatured(project!.id);
        if (!featuredResult.ok) {
          setError(featuredResult.message);
          return;
        }
        setSavedAt(new Date());
        return;
      }

      const result = await createProject(payload);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const featuredResult = await syncFeatured(result.id!);
      if (!featuredResult.ok) {
        setError(`등록은 완료됐지만 메인 노출 설정엔 실패했어요: ${featuredResult.message}`);
      }
      router.push(`/admin/works/${result.id}`);
    });
  }

  function handleDelete() {
    if (!project) return;
    if (!window.confirm(`"${project.title}"을(를) 삭제할까요? 목록·메인에서 즉시 사라져요.`)) return;
    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (result.ok) router.push("/admin/works");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24">
      <FormSection title="기본 정보">
        <TextField label="제목" required value={input.title} onChange={(v) => set("title", v)} />
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
        <SelectField<ProjectCategory>
          label="분류"
          value={input.category}
          onChange={(v) => set("category", v)}
          options={[
            { value: "professional", label: "Professional" },
            { value: "side", label: "Side" },
          ]}
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
            label="한 줄 요약"
            required
            maxLength={50}
            value={input.summary}
            onChange={(v) => set("summary", v)}
          />
        </div>
      </FormSection>

      <FormSection title="메인 노출">
        <div className="sm:col-span-2">
          <FeaturedControl
            featured={wantFeatured}
            onFeaturedChange={setWantFeatured}
            position={positionChoice}
            onPositionChange={setPositionChoice}
            cap={cap}
            otherCount={otherFeaturedCount}
            disabledReason={
              draftBlocksFeature ? "Draft 상태는 노출할 수 없어요. 먼저 상태를 Published로 바꿔주세요." : undefined
            }
          />
        </div>
      </FormSection>

      <FormSection title="상세 정보">
        <TextField label="회사" value={input.company ?? ""} onChange={(v) => set("company", v || null)} />
        <TextField label="팀" value={input.team ?? ""} onChange={(v) => set("team", v || null)} />
        <div className="sm:col-span-2">
          <ChipsMultiSelectField
            label="업종(industry)"
            hint="필터 칩·카드 라벨 기준값 · 여러 개 선택 가능 · 카테고리 관리에서 추가"
            values={input.industry ?? []}
            options={categories[input.category]}
            onChange={(v) => set("industry", v)}
          />
        </div>
        <NumberField
          label="기여도(%)"
          min={0}
          max={100}
          value={input.contribution_percent}
          onChange={(v) => set("contribution_percent", v)}
        />
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
        <TextField
          label="역할"
          value={input.role_note ?? ""}
          onChange={(v) => set("role_note", v || null)}
        />
        <TagsField label="사용 툴(tools)" values={input.tools} onChange={(v) => set("tools", v)} />
        <TextField
          label="외부 링크"
          value={input.external_url ?? ""}
          onChange={(v) => set("external_url", v || null)}
        />
      </FormSection>

      <FormSection title="본문">
        <div className="sm:col-span-2">
          <TextAreaField
            label="개요(overview)"
            rows={4}
            value={input.overview ?? ""}
            onChange={(v) => set("overview", v || null)}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            label="주요 업무(main_tasks)"
            hint="줄바꿈으로 여러 건 구분"
            rows={3}
            value={(input.main_tasks ?? []).join("\n")}
            onChange={(v) => set("main_tasks", v.split("\n"))}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            label="성과(result)"
            hint="줄바꿈으로 여러 건 구분"
            rows={3}
            value={input.result ?? ""}
            onChange={(v) => set("result", v || null)}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            label="회고(retrospective)"
            rows={3}
            value={input.retrospective ?? ""}
            onChange={(v) => set("retrospective", v || null)}
          />
        </div>
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-[var(--color-text)]">상세 본문 블록</span>
          <ContentBlockEditor blocks={input.body ?? []} onChange={(v) => set("body", v)} />
        </div>
      </FormSection>

      <FormSection title="미디어">
        <ImageUploadField
          label="썸네일"
          value={input.thumbnail_url}
          onChange={(v) => set("thumbnail_url", v)}
          pathPrefix="works/thumbnail"
          guide="권장 비율 16:9(예: 800×450px 이상) · JPG/PNG/WebP · 20MB 이하(실제로는 1~2MB 내외 권장)"
        />
        <ImageUploadField
          label="커버"
          value={input.cover_url}
          onChange={(v) => set("cover_url", v)}
          pathPrefix="works/cover"
          guide="가로로 넓은 배너 이미지 · 권장 1600×400px 이상 · JPG/PNG/WebP · 20MB 이하(2~3MB 내외 권장)"
        />
        <div className="sm:col-span-2">
          <GalleryUploadField
            label="갤러리"
            values={input.gallery_urls ?? []}
            onChange={(v) => set("gallery_urls", v)}
            pathPrefix="works/gallery"
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
