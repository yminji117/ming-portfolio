"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AdminNavLink({
  href,
  exact = false,
  children,
}: {
  href: string;
  exact?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors ${
        active
          ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
          : "text-[var(--color-text-muted)] hover:bg-[#f0f1f5] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </Link>
  );
}
