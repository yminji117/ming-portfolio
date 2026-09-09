"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { excludeVisitorByIp, type ExcludeIpState } from "@/app/admin/(protected)/analytics/actions";

const initial: ExcludeIpState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[10px] border border-[var(--color-line)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-accent-soft)] disabled:opacity-50"
    >
      {pending ? "추가 중…" : "추가"}
    </button>
  );
}

export function ExcludeIpForm() {
  const [state, formAction] = useActionState(excludeVisitorByIp, initial);

  return (
    <div className="flex flex-col gap-1.5">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <label htmlFor="exclude-ip" className="sr-only">
          제외할 IP 주소
        </label>
        <input
          id="exclude-ip"
          type="text"
          name="ip"
          inputMode="numeric"
          autoComplete="off"
          placeholder="아는 IP 직접 입력 — 예: 203.0.113.42"
          className="min-w-[200px] flex-1 rounded-[10px] border border-[var(--color-line)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)]"
        />
        <SubmitButton />
      </form>
      {state.message ? (
        <p
          className={`text-[12px] ${state.ok ? "text-[var(--color-accent)]" : "text-[#a8660f]"}`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
