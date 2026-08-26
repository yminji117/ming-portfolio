import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAnonClient } from "@supabase/supabase-js";

// /admin 세션 쿠키 갱신 — @supabase/ssr 표준 recipe(요청/응답 쿠키를 그대로 주고받아
// 만료 직전 access token을 자동 refresh)를 그대로 따른다. 리다이렉트 판단은 여기서 하지 않는다:
// Server Action은 이 matcher를 우회할 수 있어(Next.js 공식 문서 권고) proxy만으로는 인증 경계가
// 완성되지 않으므로, 실제 재검증은 src/app/admin/(protected)/layout.tsx + 각 서버 액션에서 한다.
async function refreshAdminSession(request: NextRequest) {
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

// 점검모드(site_settings.is_maintenance) — /admin은 항상 정상 접근 가능해야
// (관리자가 점검모드를 끌 수 있어야 하니) 그 외 경로만 /maintenance로 rewrite한다.
// 로그인 세션과 무관한 공개 읽기라 쿠키 기반 클라이언트 없이 익명 키로 바로 조회한다.
async function checkMaintenanceMode(): Promise<boolean> {
  const supabase = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase.from("site_settings").select("is_maintenance").eq("id", true).maybeSingle();
  return data?.is_maintenance ?? false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return refreshAdminSession(request);
  }

  if (pathname !== "/maintenance") {
    const isMaintenance = await checkMaintenanceMode();
    if (isMaintenance) {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|css|js)$).*)",
  ],
};
