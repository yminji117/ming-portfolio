"use server";

import { createClient } from "@/lib/supabase/server";

export type LoginResult = { ok: true } | { ok: false; message: string };

type LoginGuard = { allowed: boolean; locked_until: string | null };

// 잠금 확인 → 로그인 시도 → 결과 기록(성공 시 리셋, 실패 시 카운트) 순서.
// 5회 실패 시 15분 잠금(0030_admin_login_lockout.sql, IP 기준).
export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const email = input.email.trim();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, message: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();

  const { data: guard } = await supabase.rpc("admin_login_guard").single<LoginGuard>();
  if (guard && !guard.allowed) {
    const minutes = guard.locked_until
      ? Math.max(1, Math.ceil((new Date(guard.locked_until).getTime() - Date.now()) / 60000))
      : 15;
    return { ok: false, message: `로그인 시도가 너무 많아요. ${minutes}분 후 다시 시도해주세요.` };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  await supabase.rpc("admin_login_record_attempt", { p_success: !error });

  if (error) {
    return { ok: false, message: "이메일 또는 비밀번호가 일치하지 않아요." };
  }

  return { ok: true };
}
