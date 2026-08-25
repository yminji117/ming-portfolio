import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// /admin 세션 쿠키 갱신 전용 — @supabase/ssr 표준 recipe(요청/응답 쿠키를 그대로 주고받아
// 만료 직전 access token을 자동 refresh)를 그대로 따른다. 리다이렉트 판단은 여기서 하지 않는다:
// Server Action은 이 matcher를 우회할 수 있어(Next.js 공식 문서 권고) proxy만으로는 인증 경계가
// 완성되지 않으므로, 실제 재검증은 src/app/admin/(protected)/layout.tsx + 각 서버 액션에서 한다.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
