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
import { LockIcon } from "@/components/icons";
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
  onEntryUpdated: (id: string, updatedAt: string, content: string) => void;
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
            onUpdated={(updatedAt, content) => onEntryUpdated(item.id, updatedAt, content)}
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
  onUpdated: (updatedAt: string, content: string) => void;
  onDeleted: () => void;
}) {
  const [action, setAction] = useState<"edit" | "delete">("edit");
  const [stage, setStage] = useState<Stage>("closed");
  const [password, setPassword] = useState("");
  // 수정 화면 진입 시 검증됐던 비밀번호 — 그 상태에서 삭제를 시도하다 취소했을 때
  // 수정 화면(content 포함)으로 되돌아가기 위해 별도로 보관해둔다.
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const [content, setContent] = useState("");
  const [passwordEmpty, setPasswordEmpty] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAction(next: "edit" | "delete") {
    if (stage === "edit") {
      // 수정 화면에서는 상단에 삭제 버튼만 남아있으므로 next는 항상 "delete"다.
      // 편집 중인 content/verifiedPassword는 그대로 두고 삭제 비밀번호만 새로 받는다.
      setAction("delete");
      setStage("password");
      setPassword("");
      setPasswordEmpty(false);
      setActionError(null);
      return;
    }
    setAction(next);
    setStage("password");
    setPassword("");
    setContent("");
    setVerifiedPassword("");
    setPasswordEmpty(false);
    setActionError(null);
  }

  function closeModal() {
    if (verifiedPassword) {
      // 수정 화면에서 삭제를 시도하다 취소한 경우 — 수정 중이던 내용을 그대로 유지한다.
      setStage("edit");
      setPassword(verifiedPassword);
      setActionError(null);
      return;
    }
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
        setVerifiedPassword(password);
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
      onUpdated(result.entry.updated_at, content.trim());
      setVerifiedPassword("");
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
          <span className="inline-flex items-center gap-1 text-[length:var(--fs-body)] font-medium">
            {item.nickname}
            {item.is_private && <LockIcon className="size-5" />}
          </span>
          <span className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
            {formatDateTime(item.created_at)}
            {item.updated_at && ` (수정됨 ${formatDateTime(item.updated_at)})`}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
          {stage !== "edit" && (
            <>
              <button type="button" onClick={() => openAction("edit")} className="hover:text-[var(--color-accent)]">
                수정
              </button>
              <span aria-hidden="true">|</span>
            </>
          )}
          <button type="button" onClick={() => openAction("delete")} className="hover:text-red-500">
            삭제
          </button>
        </div>
      </div>

      {stage !== "edit" && !item.is_private && item.content && (
        <div className="mt-2 w-full rounded-[10px] bg-white p-4">
          <p className="whitespace-pre-wrap text-[16px] font-medium leading-[24px] text-[#131417]">
            {item.content}
          </p>
        </div>
      )}

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
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setStage("closed");
                setVerifiedPassword("");
              }}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-[var(--color-line)] px-6 text-[length:var(--fs-body)] sm:flex-none"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || content.trim().length === 0}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] disabled:opacity-40 sm:flex-none"
            >
              {isPending ? "저장 중..." : "수정"}
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
