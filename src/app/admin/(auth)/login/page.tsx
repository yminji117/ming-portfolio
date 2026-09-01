"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { loginAction } from "./actions";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  // Supabase 대시보드에서 CAPTCHA를 켜두면, 여기서 발급한 토큰이 로그인 요청에 실려가
  // GoTrue 자체가 검증한다 — Supabase Auth API를 직접 호출해 우리 서버 액션(잠금 로직)을
  // 건너뛰는 방식의 브루트포스를 막아준다. 사이트 키가 아직 없으면 위젯 없이 그대로 동작한다.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !captchaReady || !captchaRef.current || widgetId.current) return;
    widgetId.current = window.turnstile?.render(captchaRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => setCaptchaToken(token),
      "expired-callback": () => setCaptchaToken(null),
      "error-callback": () => setCaptchaToken(null),
    });
  }, [captchaReady]);

  function resetCaptcha() {
    setCaptchaToken(null);
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("보안 확인을 완료해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await loginAction({ email, password, captchaToken: captchaToken ?? undefined });
      if (!result.ok) {
        setError(result.message);
        resetCaptcha();
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

        {TURNSTILE_SITE_KEY && (
          <>
            <Script
              src="https://challenge.cloudflare.com/turnstile/v0/api.js"
              async
              defer
              onReady={() => setCaptchaReady(true)}
            />
            <div ref={captchaRef} />
          </>
        )}

        {error && <p className="text-[13px] text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending || (Boolean(TURNSTILE_SITE_KEY) && !captchaToken)}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-[15px] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-fast)] hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
        >
          {isPending ? "확인 중..." : "로그인"}
        </button>
      </form>
    </main>
  );
}
