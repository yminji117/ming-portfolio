import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// proxy(src/proxy.ts)는 세션 쿠키 갱신만 하고 리다이렉트를 하지 않으므로, 실제 인증 재검증은
// 여기서 서버 컴포넌트로 한 번 더 한다(Server Action은 proxy matcher를 우회할 수 있다는
// Next.js 공식 문서 권고에 따라 각 서버 액션 내부에서도 다시 확인한다).
export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
