import type { ReactNode } from "react";
import { AdminNavLink } from "./admin-nav-link";
import { SignOutButton } from "./sign-out-button";

// Phase 3c~3d에서 순서대로 붙는 섹션 — 지금은 라우트가 없어 비활성 표시만 해둔다(PLAN.md Phase 3 참고).
const COMING_SOON = ["About", "Careers", "Skills", "Currently Doing", "Site Settings", "Media"];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f3f4f7]">
      <aside className="flex w-[240px] flex-none flex-col gap-6 border-r border-[var(--color-line)] bg-white px-4 py-6">
        <div className="px-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
            MINJI
          </span>
          <p className="text-[15px] font-bold text-[var(--color-text)]">Admin</p>
        </div>

        <nav className="flex flex-col gap-1">
          <AdminNavLink href="/admin" exact>
            대시보드
          </AdminNavLink>
          <AdminNavLink href="/admin/works">Works</AdminNavLink>
          <AdminNavLink href="/admin/studies">Study</AdminNavLink>
          <AdminNavLink href="/admin/main">노출 관리</AdminNavLink>
          <AdminNavLink href="/admin/guestbook">방명록</AdminNavLink>
        </nav>

        <div className="flex flex-col gap-1 border-t border-[var(--color-line)] pt-4">
          <span className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            준비 중
          </span>
          {COMING_SOON.map((label) => (
            <span
              key={label}
              className="flex cursor-not-allowed items-center rounded-[10px] px-3 py-2 text-[13px] text-[#b7bac2]"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--color-line)] pt-4">
          <span className="truncate px-1 text-[12px] text-[var(--color-text-muted)]">{email}</span>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 px-8 py-8 lg:px-12">{children}</div>
    </div>
  );
}
