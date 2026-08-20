import { createHmac, timingSafeEqual } from "crypto";

// PRD 7.4 — 인증 성공 후 해당 세션에서 10분간 유효
const SESSION_TTL_MS = 10 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.GUESTBOOK_SESSION_SECRET;
  if (!secret) {
    throw new Error("GUESTBOOK_SESSION_SECRET 환경변수가 설정되지 않았어요.");
  }
  return secret;
}

// 서명된(HMAC) 토큰이 곧 인증 증거다 — 쿠키 값을 조작해도 서명이 맞지 않으면 거부된다.
export function createGuestbookSessionToken(entryId: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${entryId}.${expiresAt}`;
  const signature = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyGuestbookSessionToken(token: string, entryId: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [id, expiresAtStr, signature] = parts;
  if (id !== entryId) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = createHmac("sha256", getSecret())
    .update(`${id}.${expiresAtStr}`)
    .digest("hex");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
