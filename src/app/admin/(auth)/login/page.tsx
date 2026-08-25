"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginAction({ email, password });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f4f7] px-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[360px] flex-col gap-5 rounded-[20px] border border-[var(--color-line)] bg-white p-8 shadow-[0_1px_2px_rgba(19,20,23,0.04),0_16px_40px_rgba(19,20,23,0.08)]"
      >
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
            MINJI Admin
          </span>
          <h1 className="text-[22px] font-bold text-[var(--color-text)]">로그인</h1>
        </div>

        <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-text-muted)]">
          이메일
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-[10px] border border-[var(--color-line)] bg-white px-3.5 text-[15px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-text-muted)]">
          비밀번호
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-[10px] border border-[var(--color-line)] bg-white px-3.5 text-[15px] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        {error && <p className="text-[13px] text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-[15px] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
        >
          {isPending ? "확인 중..." : "로그인"}
        </button>
      </form>
    </main>
  );
}
