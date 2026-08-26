"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createSkill,
  deleteSkill,
  swapSkillOrder,
  updateSkill,
} from "@/app/admin/(protected)/about/actions";
import { TextField } from "@/components/admin/admin-form-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { Skill, SkillGroup } from "@/lib/types";

const GROUP_LABEL: Record<SkillGroup, string> = { main: "주 사용", sub: "사용 가능" };

export function SkillListEditor({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState<Record<SkillGroup, string>>({ main: "", sub: "" });
  const [newIconUrl, setNewIconUrl] = useState<Record<SkillGroup, string | null>>({
    main: null,
    sub: null,
  });

  const groups = useMemo(() => {
    const byGroup: Record<SkillGroup, Skill[]> = { main: [], sub: [] };
    skills.forEach((skill) => byGroup[skill.group].push(skill));
    (["main", "sub"] as SkillGroup[]).forEach((g) => byGroup[g].sort((a, b) => a.order - b.order));
    return byGroup;
  }, [skills]);

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.message ?? "처리에 실패했어요.");
        return;
      }
      router.refresh();
    });
  }

  function addSkill(group: SkillGroup) {
    const name = newName[group].trim();
    if (!name) return;
    const maxOrder = groups[group].reduce((max, s) => Math.max(max, s.order), -1);
    run(async () => {
      const result = await createSkill({
        name,
        icon_url: newIconUrl[group],
        group,
        order: maxOrder + 1,
      });
      if (result.ok) {
        setNewName((prev) => ({ ...prev, [group]: "" }));
        setNewIconUrl((prev) => ({ ...prev, [group]: null }));
      }
      return result;
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[var(--color-line)] bg-white p-5">
      <h2 className="text-[14px] font-bold text-[var(--color-text)]">Skills</h2>
      {error && <p className="text-[12px] text-red-600">{error}</p>}

      {(["main", "sub"] as SkillGroup[]).map((group) => (
        <div key={group} className="flex flex-col gap-3">
          <p className="text-[13px] font-medium text-[var(--color-text)]">{GROUP_LABEL[group]}</p>

          {groups[group].length === 0 ? (
            <p className="rounded-[10px] border border-dashed border-[var(--color-line)] px-4 py-3 text-[13px] text-[var(--color-text-muted)]">
              등록된 스킬이 없어요.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {groups[group].map((skill, index) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-line)] px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    {skill.icon_url && (
                      // 관리 목록 썸네일이라 next/image 최적화 없이 바로 렌더한다.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={skill.icon_url} alt="" className="size-[18px]" />
                    )}
                    <input
                      type="text"
                      defaultValue={skill.name}
                      onBlur={(event) => {
                        const name = event.target.value.trim();
                        if (!name || name === skill.name) {
                          event.target.value = skill.name;
                          return;
                        }
                        run(() => updateSkill(skill.id, { name, icon_url: skill.icon_url, group, order: skill.order }));
                      }}
                      className="w-[140px] rounded-[6px] border border-transparent bg-transparent px-1.5 py-0.5 text-[13px] text-[var(--color-text)] outline-none hover:border-[var(--color-line)] focus:border-[var(--color-accent)]"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={isPending || index === 0}
                      onClick={() => run(() => swapSkillOrder(skill.id, groups[group][index - 1].id))}
                      className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#f3f4f7] disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={isPending || index === groups[group].length - 1}
                      onClick={() => run(() => swapSkillOrder(skill.id, groups[group][index + 1].id))}
                      className="h-7 w-7 rounded-full text-[13px] text-[var(--color-text-muted)] hover:bg-[#f3f4f7] disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (!confirm(`"${skill.name}" 스킬을 삭제할까요?`)) return;
                        run(() => deleteSkill(skill.id));
                      }}
                      className="ml-1 text-[12px] text-red-600 hover:underline disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              addSkill(group);
            }}
            className="flex flex-wrap items-end gap-3 rounded-[10px] border border-dashed border-[var(--color-line)] p-3"
          >
            <div className="w-[160px]">
              <TextField
                label="이름"
                value={newName[group]}
                onChange={(v) => setNewName((prev) => ({ ...prev, [group]: v }))}
                placeholder="예: Figma"
              />
            </div>
            <div>
              <ImageUploadField
                label="아이콘"
                value={newIconUrl[group]}
                onChange={(url) => setNewIconUrl((prev) => ({ ...prev, [group]: url }))}
                pathPrefix="about/skills"
                guide="선택 사항 · 정사각형 권장"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--color-accent)] px-4 text-[12px] font-semibold text-[var(--color-accent-ink)] disabled:opacity-50"
            >
              추가
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
