"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminNavLink } from "./admin-nav-link";
import { SignOutButton } from "./sign-out-button";

// PRD 9.9 규칙 #6 — 어드민은 PC(1024px 이상) 기준으로 설계돼 있어 좁은 화면에서는 표/폼이
// 다 깨진다. 1024px 미만에서는 안내 화면만 보여주고, 방명록(/admin/guestbook)만 예외로 둔다
// (외출 중에도 새 글 확인 정도는 필요할 수 있어서 — 액션 버튼도 다 작아서 못 누를 수준까진
// 아니라 별도 읽기 전용 UI를 새로 만들진 않았다).
const GUARD_EXEMPT_PREFIX = "/admin/guestbook";

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const isExempt = pathname.startsWith(GUARD_EXEMPT_PREFIX);

  return (
    <>
      {!isExempt && (
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center lg:hidden">
          <p className="text-[18px] font-bold text-[var(--color-text)]">PC에서 접속해 주세요</p>
          <p className="text-[13px] text-[var(--color-text-muted)]">
            어드민은 1024px 이상 화면에 맞춰져 있어요. 노트북·데스크톱에서 다시 열어주세요.
          </p>
        </div>
      )}

      <div
        className={`flex min-h-screen flex-col bg-[#f3f4f7] lg:flex-row ${isExempt ? "" : "hidden lg:flex"}`}
      >
        <aside className="flex w-full flex-none flex-col gap-4 border-b border-[var(--color-line)] bg-white px-4 py-4 lg:w-[240px] lg:gap-6 lg:border-b-0 lg:border-r lg:py-6">
          <div className="px-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
              MINJI
            </span>
            <p className="text-[15px] font-bold text-[var(--color-text)]">Admin</p>
          </div>

          {/* 방명록 예외로 모바일에서도 이 shell이 뜰 수 있어 nav는 가로 스크롤로, 나머지 항목은
              접속 자체가 안 되니(위 안내 화면으로 막힘) 굳이 숨기지 않고 그대로 둔다. */}
          <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            <AdminNavLink href="/admin" exact>
              대시보드
            </AdminNavLink>
            <AdminNavLink href="/admin/works">Works</AdminNavLink>
            <AdminNavLink href="/admin/studies">Study</AdminNavLink>
            <AdminNavLink href="/admin/about">About</AdminNavLink>
            <AdminNavLink href="/admin/currently-doing">Currently Doing</AdminNavLink>
            <AdminNavLink href="/admin/categories">카테고리 관리</AdminNavLink>
            <AdminNavLink href="/admin/main">노출 관리</AdminNavLink>
            <AdminNavLink href="/admin/guestbook">방명록</AdminNavLink>
            <AdminNavLink href="/admin/analytics">분석</AdminNavLink>
            <AdminNavLink href="/admin/site-settings">Site Settings</AdminNavLink>
            <AdminNavLink href="/admin/media">미디어</AdminNavLink>
            <AdminNavLink href="/admin/trash">휴지통</AdminNavLink>
          </nav>

          <div className="flex flex-col gap-2 border-t border-[var(--color-line)] pt-3 lg:mt-auto lg:pt-4">
            <span className="truncate px-1 text-[12px] text-[var(--color-text-muted)]">{email}</span>
            <SignOutButton />
          </div>
        </aside>

        <div className="flex-1 px-4 py-6 lg:px-12 lg:py-8">{children}</div>
      </div>
    </>
  );
}
