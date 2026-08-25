"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/admin/actions";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await signOutAction();
          router.push("/admin/login");
          router.refresh();
        })
      }
      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-line)] px-3 text-[13px] font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40"
    >
      {isPending ? "..." : "로그아웃"}
    </button>
  );
}
