"use client";

import { useState, useTransition } from "react";
import {
  deleteGuestbookEntryAdmin,
  setGuestbookFlag,
  setGuestbookHidden,
  setGuestbookMemo,
  setGuestbookRead,
} from "@/app/admin/(protected)/guestbook/actions";
import type { GuestbookEntryAdmin, GuestbookFlag } from "@/lib/types";

const FLAG_LABEL: Record<GuestbookFlag, string> = {
  normal: "정상",
  hold: "보류",
  spam: "스팸",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GuestbookAdminTable({ entries }: { entries: GuestbookEntryAdmin[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-[var(--color-line)] bg-white px-6 py-16 text-center text-[14px] text-[var(--color-text-muted)]">
        해당하는 게시글이 없어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <GuestbookAdminRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

function GuestbookAdminRow({ entry }: { entry: GuestbookEntryAdmin }) {
  const [isPending, startTransition] = useTransition();
  const [memo, setMemo] = useState(entry.admin_memo ?? "");
  const [isRead, setIsRead] = useState(entry.is_read);
  const [isHidden, setIsHidden] = useState(entry.is_hidden);
  const [flag, setFlag] = useState<GuestbookFlag>(entry.flag);
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  return (
    <div
      className={`flex flex-col gap-3 rounded-[16px] border bg-white p-5 shadow-[0_1px_2px_rgba(19,20,23,0.04)] ${
        isRead ? "border-[var(--color-line)]" : "border-[var(--color-accent)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-[var(--color-text)]">{entry.nickname}</span>
            {entry.is_private && (
              <span className="rounded-full bg-[#eceef3] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                비공개
              </span>
            )}
            {!isRead && (
              <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent)]">
                미확인
              </span>
            )}
          </div>
          <span className="text-[12px] tabular-nums text-[var(--color-text-muted)]">
            {formatDate(entry.created_at)}
            {entry.updated_at ? ` · 수정됨 ${formatDate(entry.updated_at)}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={flag}
            disabled={isPending}
            onChange={(event) => {
              const next = event.target.value as GuestbookFlag;
              setFlag(next);
              startTransition(async () => {
                await setGuestbookFlag(entry.id, next);
              });
            }}
            className="h-8 rounded-full border border-[var(--color-line)] bg-white px-3 text-[12px] font-medium text-[var(--color-text)] outline-none"
          >
            {(Object.keys(FLAG_LABEL) as GuestbookFlag[]).map((key) => (
              <option key={key} value={key}>
                {FLAG_LABEL[key]}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              const next = !isHidden;
              setIsHidden(next);
              startTransition(async () => {
                await setGuestbookHidden(entry.id, next);
              });
            }}
            className={`h-8 rounded-full border px-3 text-[12px] font-medium transition-colors ${
              isHidden
                ? "border-[var(--color-line)] bg-[#f0f1f5] text-[var(--color-text-muted)]"
                : "border-[var(--color-line)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
            }`}
          >
            {isHidden ? "숨김 해제" : "숨기기"}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!window.confirm("이 게시글을 삭제할까요? 목록에서 즉시 사라져요.")) return;
              startTransition(async () => {
                const result = await deleteGuestbookEntryAdmin(entry.id);
                if (result.ok) setDeleted(true);
              });
            }}
            className="h-8 rounded-full border border-[var(--color-line)] px-3 text-[12px] font-medium text-red-600 transition-colors hover:border-red-600"
          >
            삭제
          </button>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-text)]">
        {entry.content}
      </p>

      <textarea
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        onBlur={() => {
          if (memo === (entry.admin_memo ?? "")) return;
          startTransition(async () => {
            await setGuestbookMemo(entry.id, memo);
          });
        }}
        placeholder="운영 메모 (방문자에게는 보이지 않아요)"
        rows={2}
        className="w-full resize-none rounded-[10px] border border-dashed border-[var(--color-line)] bg-[#fafbfd] p-2.5 text-[13px] text-[var(--color-text)] outline-none placeholder:text-[#b7bac2] focus:border-[var(--color-accent)]"
      />

      {!isRead && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setIsRead(true);
            startTransition(async () => {
              await setGuestbookRead(entry.id, true);
            });
          }}
          className="self-start text-[12px] font-medium text-[var(--color-accent)] hover:underline"
        >
          확인 처리
        </button>
      )}
    </div>
  );
}
