"use server";

import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getGuestbookPage } from "@/lib/data";
import { LIST_PAGE_SIZE } from "@/lib/constants";
import {
  createGuestbookSessionToken,
  verifyGuestbookSessionToken,
} from "@/lib/guestbook-session";
import type { GuestbookEntry } from "@/lib/types";

export async function loadMoreGuestbook(
  offset: number,
): Promise<{ items: GuestbookEntry[]; total: number }> {
  return getGuestbookPage(offset, LIST_PAGE_SIZE);
}

const CONTENT_MAX = 500;
// PRD 7.2 — 아이디: 2~12자, 한글/영문/숫자/언더바만, 공백 불가
const NICKNAME_PATTERN = /^[a-zA-Z0-9가-힣_]{2,12}$/;
// PRD 7.2 — 4자리 숫자 또는 4~16자 문자열(택1)
const PASSWORD_PATTERN = /^(\d{4}|[a-zA-Z0-9_]{4,16})$/;

const GENERIC_ERROR = "등록에 실패했어요. 다시 시도해 주세요.";

type NewEntry = { id: string; nickname: string; created_at: string };

export type CreateGuestbookResult =
  | { ok: true; entry: NewEntry }
  | { ok: false; message: string };

// 도배 방지(IP 기준 rate limit)와 비밀번호 재검증은 전부 DB 함수(0009_guestbook_functions.sql)
// 안에서 서버가 직접 요청 헤더로 IP를 뽑아 처리한다 — 이 액션은 그 앞단 입력 검증 + 호출만 맡는다.
// (RPC는 anon key만으로 직접 호출도 가능하므로, DB 쪽 재검증이 실제 신뢰 경계다.)
export async function createGuestbookEntry(input: {
  nickname: string;
  content: string;
  password: string;
  honeypot: string;
}): Promise<CreateGuestbookResult> {
  // 허니팟 — 봇이 채웠다면 조용히 실패 처리(등록되지 않음을 사용자에게 굳이 구분해 알리지 않는다)
  if (input.honeypot) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const nickname = input.nickname.trim();
  const content = input.content.trim();

  if (!NICKNAME_PATTERN.test(nickname)) {
    return { ok: false, message: "아이디는 2~12자 한글/영문/숫자/언더바만 가능해요." };
  }
  if (!content || content.length > CONTENT_MAX) {
    return { ok: false, message: `내용은 1~${CONTENT_MAX}자로 입력해주세요.` };
  }
  if (!PASSWORD_PATTERN.test(input.password)) {
    return { ok: false, message: "비밀번호는 4자리 숫자 또는 4~16자 문자로 입력해주세요." };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const headerList = await headers();
  const userAgent = headerList.get("user-agent");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("guestbook_insert", {
    p_nickname: nickname,
    p_content: content,
    p_password_hash: passwordHash,
    p_user_agent: userAgent,
  });

  if (error) {
    if (error.message.includes("rate_limited")) {
      return { ok: false, message: "잠시 후 다시 시도해 주세요." };
    }
    console.error("createGuestbookEntry failed:", error.message);
    return { ok: false, message: GENERIC_ERROR };
  }

  const entry = (data as NewEntry[] | null)?.[0];
  if (!entry) return { ok: false, message: GENERIC_ERROR };

  return { ok: true, entry };
}

export type VerifyGuestbookResult =
  | { ok: true; content: string }
  | { ok: false; message: string };

// PRD 7.4 — [수정] 클릭 후 비밀번호 확인. 성공 시 서명 쿠키로 10분 세션(UX 편의용 빠른 실패 처리)을
// 발급하고, 그 순간에만 본문을 함께 내려준다(그 전까지는 어떤 응답에도 content가 실리지 않는다).
// 5회 실패 잠금 정책은 제거됐다(guestbook_verify가 더 이상 잠금을 검사/기록하지 않음).
export async function verifyGuestbookPassword(
  entryId: string,
  password: string,
): Promise<VerifyGuestbookResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("guestbook_verify", {
    p_id: entryId,
    p_password: password,
  });

  if (error) {
    console.error("verifyGuestbookPassword failed:", error.message);
    return { ok: false, message: "아이디 또는 비밀번호가 일치하지 않아요." };
  }

  const result = (data as { ok: boolean; content: string | null }[] | null)?.[0];

  if (!result?.ok) {
    return { ok: false, message: "아이디 또는 비밀번호가 일치하지 않아요." };
  }

  const token = createGuestbookSessionToken(entryId);
  const cookieStore = await cookies();
  cookieStore.set(`gb_session_${entryId}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/here",
  });

  return { ok: true, content: result.content ?? "" };
}

type UpdatedEntry = { id: string; nickname: string; created_at: string; updated_at: string };

export type UpdateGuestbookResult =
  | { ok: true; entry: UpdatedEntry }
  | { ok: false; message: string };

// PRD 7.4 — 서명 쿠키(10분)가 있어야 시도라도 해보게 하지만, 실제 쓰기 권한은 비밀번호를
// 다시 보내 DB(guestbook_apply_update)가 재검증한 결과로만 결정된다. 쿠키는 신뢰 경계가 아니다.
export async function updateGuestbookEntry(
  entryId: string,
  password: string,
  content: string,
): Promise<UpdateGuestbookResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(`gb_session_${entryId}`)?.value;
  if (!token || !verifyGuestbookSessionToken(token, entryId)) {
    return { ok: false, message: "인증이 만료됐어요. 비밀번호를 다시 확인해주세요." };
  }

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > CONTENT_MAX) {
    return { ok: false, message: `내용은 1~${CONTENT_MAX}자로 입력해주세요.` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("guestbook_apply_update", {
    p_id: entryId,
    p_password: password,
    p_content: trimmed,
  });

  if (error || !(data as UpdatedEntry[] | null)?.[0]) {
    if (error?.message.includes("invalid_credentials")) {
      return { ok: false, message: "인증이 만료됐어요. 비밀번호를 다시 확인해주세요." };
    }
    console.error("updateGuestbookEntry failed:", error?.message);
    return { ok: false, message: "저장에 실패했어요. 다시 시도해 주세요." };
  }

  return { ok: true, entry: (data as UpdatedEntry[])[0] };
}

export type DeleteGuestbookResult = { ok: true } | { ok: false; message: string };

// updateGuestbookEntry와 동일한 신뢰 경계 — 서명 쿠키(10분 세션)는 UX용이고, 실제 삭제 권한은
// guestbook_apply_delete가 비밀번호를 다시 검증한 결과로만 결정된다. deleted_at만 채우는
// soft delete라 guestbook_public 뷰에서 즉시 빠진다(0002_rls.sql 참고).
export async function deleteGuestbookEntry(
  entryId: string,
  password: string,
): Promise<DeleteGuestbookResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(`gb_session_${entryId}`)?.value;
  if (!token || !verifyGuestbookSessionToken(token, entryId)) {
    return { ok: false, message: "인증이 만료됐어요. 비밀번호를 다시 확인해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("guestbook_apply_delete", {
    p_id: entryId,
    p_password: password,
  });

  if (error || !(data as { id: string }[] | null)?.[0]) {
    if (error?.message.includes("invalid_credentials")) {
      return { ok: false, message: "인증이 만료됐어요. 비밀번호를 다시 확인해주세요." };
    }
    console.error("deleteGuestbookEntry failed:", error?.message);
    return { ok: false, message: "삭제에 실패했어요. 다시 시도해 주세요." };
  }

  cookieStore.delete(`gb_session_${entryId}`);
  return { ok: true };
}
