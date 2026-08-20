"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  loadMoreGuestbook,
  updateGuestbookEntry,
  verifyGuestbookPassword,
} from "@/app/here/actions";
import { formatDateTime } from "@/lib/format";
import type { GuestbookEntry } from "@/lib/types";

export function GuestbookList({
  items,
  total,
  onItemsChange,
  onEntryUpdated,
}: {
  items: GuestbookEntry[];
  total: number;
  onItemsChange: (items: GuestbookEntry[]) => void;
  onEntryUpdated: (id: string, updatedAt: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasMore = items.length < total;

  function handleLoadMore() {
    startTransition(async () => {
      const next = await loadMoreGuestbook(items.length);
      onItemsChange([...items, ...next.items]);
    });
  }

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
        첫 번째 방문자가 되어주세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="divide-y divide-[var(--color-line)] border-t border-black">
        {items.map((item) => (
          <GuestbookRow
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
            onUpdated={(updatedAt) => {
              onEntryUpdated(item.id, updatedAt);
              setOpenId(null);
            }}
          />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="mt-8 inline-flex h-11 items-center justify-center self-center rounded-full border border-[var(--color-line)] px-6 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
        >
          {isPending ? "불러오는 중..." : "더보기"}
        </button>
      )}
    </div>
  );
}

function GuestbookRow({
  item,
  isOpen,
  onToggle,
  onUpdated,
}: {
  item: GuestbookEntry;
  isOpen: boolean;
  onToggle: () => void;
  onUpdated: (updatedAt: string) => void;
}) {
  const [stage, setStage] = useState<"password" | "edit">("password");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (!isOpen) {
      setStage("password");
      setPassword("");
      setContent("");
      setError(null);
    }
    onToggle();
  }

  function handleVerify(event: FormEvent) {
    event.preventDefault();
    if (!password || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await verifyGuestbookPassword(item.id, password);
      if (!result.ok) {
        setError(
          result.remainingAttempts != null
            ? `${result.message} (남은 시도 ${result.remainingAttempts}회)`
            : result.message,
        );
        return;
      }
      setContent(result.content);
      setStage("edit");
    });
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!content.trim() || isPending) return;
    setError(null);
    startTransition(async () => {
      // 인증 단계에서 입력한 비밀번호를 그대로 재사용 — DB가 저장 시점에 다시 검증한다
      // (서명 쿠키는 UX용 빠른 실패 처리일 뿐, 실제 쓰기 권한은 이 비밀번호 재검증으로 결정됨).
      const result = await updateGuestbookEntry(item.id, password, content);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onUpdated(result.entry.updated_at);
    });
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[length:var(--fs-body)] font-medium">{item.nickname}</span>
          <span className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
            {formatDateTime(item.created_at)}
            {item.updated_at && ` (수정됨 ${formatDateTime(item.updated_at)})`}
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="shrink-0 text-[length:var(--fs-caption)] text-[var(--color-text-muted)] underline underline-offset-4 hover:text-[var(--color-accent)]"
        >
          {isOpen ? "닫기" : "수정"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 rounded-[var(--radius)] border border-[var(--color-line)] p-4">
          {stage === "password" ? (
            <form onSubmit={handleVerify} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                  아이디
                </span>
                <span className="text-[length:var(--fs-body)]">{item.nickname}</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호"
                autoFocus
                className="h-11 rounded-[var(--radius)] border border-[var(--color-line)] px-4 text-[length:var(--fs-body)] outline-none focus:border-[var(--color-accent)]"
              />
              {error && (
                <p role="alert" aria-live="polite" className="text-[length:var(--fs-caption)] text-red-500">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isPending || password.length === 0}
                className="inline-flex h-10 items-center justify-center self-end rounded-full bg-black px-6 text-[length:var(--fs-body)] text-white disabled:opacity-40"
              >
                {isPending ? "확인 중..." : "확인"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value.slice(0, 500))}
                maxLength={500}
                rows={4}
                autoFocus
                className="w-full resize-none rounded-[var(--radius)] border border-[var(--color-line)] p-4 text-[length:var(--fs-body)] outline-none focus:border-[var(--color-accent)]"
              />
              <span className="self-end text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                {content.length} / 500
              </span>
              {error && (
                <p role="alert" aria-live="polite" className="text-[length:var(--fs-caption)] text-red-500">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isPending || content.trim().length === 0}
                className="inline-flex h-10 items-center justify-center self-end rounded-full bg-[var(--color-accent)] px-6 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] disabled:opacity-40"
              >
                {isPending ? "저장 중..." : "등록"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
