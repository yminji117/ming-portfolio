"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createGuestbookEntry } from "@/app/here/actions";
import { CheckboxCheckedIcon, CheckboxUncheckedIcon } from "@/components/icons";
import type { GuestbookEntry } from "@/lib/types";

const CONTENT_MAX = 500;
// PRD 7.2 — 아이디 2~12자 한글/영문/숫자/언더바, 비밀번호 4자리 숫자 또는 4~16자 문자열
const NICKNAME_PATTERN = /^[a-zA-Z0-9가-힣_]{2,12}$/;
const PASSWORD_PATTERN = /^(\d{4}|[a-zA-Z0-9_]{4,16})$/;

export function GuestbookForm({ onCreated }: { onCreated: (entry: GuestbookEntry) => void }) {
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isValid =
    content.trim().length > 0 &&
    content.length <= CONTENT_MAX &&
    NICKNAME_PATTERN.test(nickname) &&
    PASSWORD_PATTERN.test(password);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValid || isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await createGuestbookEntry({ nickname, content, password, honeypot, isPrivate });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onCreated({ ...result.entry, updated_at: null });
      setContent("");
      setNickname("");
      setPassword("");
      setIsPrivate(true);
    });
  }

  const remaining = CONTENT_MAX - content.length;
  const nearLimit = remaining <= 10;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[8px] border border-[#cecece] bg-[#fafbfd] px-[17px] py-[25px] sm:p-[25px]"
    >
      {/* 허니팟 — 실제 방문자에게는 보이지 않는 필드. 봇이 채우면 서버에서 조용히 거부한다. */}
      <input
        type="text"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="아이디 (2~12자)"
          maxLength={12}
          className="h-11 w-full rounded-[10px] border border-[var(--color-line)] bg-white px-4 text-[length:var(--fs-body)] outline-none placeholder:text-[rgba(19,20,23,0.5)] focus:border-[var(--color-accent)] sm:flex-1"
        />
        <div className="relative flex-1">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호 작성 (4~12자)"
            maxLength={16}
            className="h-11 w-full rounded-[10px] border border-[var(--color-line)] bg-white px-4 pr-14 text-[length:var(--fs-body)] outline-none placeholder:text-[rgba(19,20,23,0.5)] focus:border-[var(--color-accent)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[length:var(--fs-caption)] text-[var(--color-text-muted)]"
          >
            {showPassword ? "숨기기" : "보기"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value.slice(0, CONTENT_MAX))}
          maxLength={CONTENT_MAX}
          rows={4}
          placeholder="피드백을 남겨주세요 :-)"
          className="h-[129px] w-full resize-none rounded-[10px] border border-[var(--color-line)] bg-white p-4 text-[length:var(--fs-body)] outline-none placeholder:text-[rgba(19,20,23,0.5)] focus:border-[var(--color-accent)]"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1 text-[13px] text-black">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => setIsPrivate(event.target.checked)}
              className="sr-only"
            />
            {isPrivate ? (
              <CheckboxCheckedIcon className="size-6" />
            ) : (
              <CheckboxUncheckedIcon className="size-6" />
            )}
            비공개로 작성
          </label>
          <span
            className={`text-[length:var(--fs-caption)] ${
              nearLimit ? "text-red-500" : "text-[#d5d5d5]"
            }`}
          >
            {content.length} / {CONTENT_MAX}
          </span>
        </div>
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="text-[length:var(--fs-caption)] text-red-500">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <ul className="min-w-0 flex-1 list-disc space-y-0.5 pl-5 text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
          <li>비밀번호를 잊으면 수정/삭제할 수 없어요.</li>
        </ul>
        <button
          type="submit"
          disabled={!isValid || isPending}
          className="inline-flex h-[40px] w-full shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-8 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 sm:w-auto"
        >
          {isPending ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
