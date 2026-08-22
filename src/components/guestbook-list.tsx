"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  deleteGuestbookEntry,
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
  onEntryDeleted,
}: {
  items: GuestbookEntry[];
  total: number;
  onItemsChange: (items: GuestbookEntry[]) => void;
  onEntryUpdated: (id: string, updatedAt: string) => void;
  onEntryDeleted: (id: string) => void;
}) {
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
            onUpdated={(updatedAt) => onEntryUpdated(item.id, updatedAt)}
            onDeleted={() => onEntryDeleted(item.id)}
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

// Figma '최종' node 305:3442/305:3467/305:3456/305:3639 — 팝업 카드(흰 배경, rounded-10,
// px-40 py-36) + 반투명 배경. shakeKey가 바뀔 때마다 흔들림 애니메이션을 새로 재생한다.
function GuestbookModal({
  children,
  maxWidthClass,
  shakeKey,
  onDismiss,
}: {
  children: ReactNode;
  maxWidthClass: string;
  shakeKey?: number;
  onDismiss: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
        onClick={onDismiss}
      >
        <motion.div
          key={shakeKey ?? "static"}
          onClick={(event) => event.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, x: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: shakeKey ? [0, -8, 8, -6, 6, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: shakeKey ? 0.4 : 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full ${maxWidthClass} rounded-[10px] bg-white px-10 py-9`}
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}

type Stage = "closed" | "password" | "mismatch" | "edit" | "delete-confirm";

// Figma '최종' node 305:3481("here →_본문 수정") — 수정/삭제 둘 다 같은 비밀번호 팝업으로
// 시작해서, 인증 성공 시에만 결과가 갈라진다(수정: 행 아래 본문 수정 박스 / 삭제: 삭제 확인 팝업).
function GuestbookRow({
  item,
  onUpdated,
  onDeleted,
}: {
  item: GuestbookEntry;
  onUpdated: (updatedAt: string) => void;
  onDeleted: () => void;
}) {
  const [action, setAction] = useState<"edit" | "delete">("edit");
  const [stage, setStage] = useState<Stage>("closed");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [passwordEmpty, setPasswordEmpty] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAction(next: "edit" | "delete") {
    if (stage === "edit" && action === "edit" && next === "edit") {
      setStage("closed");
      return;
    }
    setAction(next);
    setStage("password");
    setPassword("");
    setContent("");
    setPasswordEmpty(false);
    setActionError(null);
  }

  function closeModal() {
    setStage("closed");
  }

  function handlePasswordConfirm() {
    if (isPending) return;
    if (!password.trim()) {
      setPasswordEmpty(true);
      setShakeCount((c) => c + 1);
      return;
    }
    setPasswordEmpty(false);
    startTransition(async () => {
      const result = await verifyGuestbookPassword(item.id, password);
      if (!result.ok) {
        setStage("mismatch");
        return;
      }
      if (action === "edit") {
        setContent(result.content);
        setStage("edit");
      } else {
        setStage("delete-confirm");
      }
    });
  }

  function handleSave() {
    if (!content.trim() || isPending) return;
    setActionError(null);
    startTransition(async () => {
      // 인증 단계에서 입력한 비밀번호를 그대로 재사용 — DB가 저장 시점에 다시 검증한다
      // (서명 쿠키는 UX용 빠른 실패 처리일 뿐, 실제 쓰기 권한은 이 비밀번호 재검증으로 결정됨).
      const result = await updateGuestbookEntry(item.id, password, content);
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      onUpdated(result.entry.updated_at);
      setStage("closed");
    });
  }

  function handleDelete() {
    if (isPending) return;
    setActionError(null);
    startTransition(async () => {
      const result = await deleteGuestbookEntry(item.id, password);
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      onDeleted();
      setStage("closed");
    });
  }

  const remaining = 500 - content.length;

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
        <div className="flex shrink-0 items-center gap-3 text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
          <button type="button" onClick={() => openAction("edit")} className="hover:text-[var(--color-accent)]">
            수정
          </button>
          <span aria-hidden="true">|</span>
          <button type="button" onClick={() => openAction("delete")} className="hover:text-red-500">
            삭제
          </button>
        </div>
      </div>

      {stage === "edit" && (
        <div className="mt-2 flex flex-col items-end gap-2">
          <div className="w-full rounded-[10px] border border-[var(--color-line)] bg-white p-4">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value.slice(0, 500))}
              maxLength={500}
              rows={3}
              autoFocus
              className="w-full resize-none text-[16px] font-medium text-[#131417] outline-none"
            />
          </div>
          <span className="text-[13px]">
            <span className="text-[#0a0a0a]">{content.length}</span>
            <span className="text-[#d5d5d5]"> /500</span>
          </span>
          {actionError && (
            <p role="alert" aria-live="polite" className="self-start text-[length:var(--fs-caption)] text-red-500">
              {actionError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStage("closed")}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-6 text-[length:var(--fs-body)]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || content.trim().length === 0}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] disabled:opacity-40"
            >
              {isPending ? "저장 중..." : "등록"}
            </button>
          </div>
          <span className="sr-only" aria-live="polite">
            {remaining}자 남음
          </span>
        </div>
      )}

      {stage === "password" && (
        <GuestbookModal
          maxWidthClass="max-w-[424px]"
          shakeKey={passwordEmpty ? shakeCount : undefined}
          onDismiss={closeModal}
        >
          <div className="flex flex-col items-center gap-5">
            <p
              className={`p-[10px] text-center text-[16px] font-medium ${
                passwordEmpty ? "text-[#e40d0d]" : "text-[#0a0a0a]"
              }`}
            >
              비밀번호를 입력해 주세요.
            </p>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (event.target.value.trim()) setPasswordEmpty(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handlePasswordConfirm();
                }
              }}
              autoFocus
              placeholder="비밀번호 입력 (4~12자)"
              className="w-full rounded-[4px] border border-[#d2d5db] px-[10px] py-[6px] text-center text-[16px] text-[#0a0a0a] outline-none placeholder:text-[#737579]"
            />
          </div>
          <div className="mt-5 flex w-full gap-[10px]">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-[4px] border border-[#d2d5db] px-7 py-[6px] text-[16px] text-[#0a0a0a]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handlePasswordConfirm}
              disabled={isPending}
              className="flex-1 rounded-[4px] border border-[#013dff] bg-[#0a0a0a] px-7 py-[6px] text-[16px] text-white disabled:opacity-60"
            >
              {isPending ? "확인 중..." : "확인"}
            </button>
          </div>
        </GuestbookModal>
      )}

      {stage === "mismatch" && (
        <GuestbookModal maxWidthClass="max-w-[310px]" onDismiss={closeModal}>
          <p className="whitespace-nowrap p-[10px] text-center text-[16px] font-medium text-[#0a0a0a]">
            아이디와 비밀번호를 확인해 주세요.
          </p>
          <div className="mt-[27px] flex w-full">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-[4px] border border-[#d2d5db] px-7 py-[6px] text-[16px] text-[#0a0a0a]"
            >
              확인
            </button>
          </div>
        </GuestbookModal>
      )}

      {stage === "delete-confirm" && (
        <GuestbookModal maxWidthClass="max-w-[310px]" onDismiss={closeModal}>
          <p className="p-[10px] text-center text-[16px] font-medium leading-[24px] text-[#0a0a0a]">
            소중한 게시물을
            <br />
            정말정말 삭제하시겠어요?? 🥹
          </p>
          {actionError && (
            <p role="alert" aria-live="polite" className="mt-1 text-center text-[13px] text-red-500">
              {actionError}
            </p>
          )}
          <div className="mt-[27px] flex w-full gap-[10px]">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-[4px] border border-[#d2d5db] px-7 py-[6px] text-[16px] text-[#0a0a0a]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-[4px] border border-[#013dff] bg-[#0a0a0a] px-7 py-[6px] text-[16px] text-white disabled:opacity-60"
            >
              {isPending ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </GuestbookModal>
      )}
    </div>
  );
}
