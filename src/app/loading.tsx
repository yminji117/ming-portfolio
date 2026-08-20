import { LoadingScreen } from "@/components/loading-screen";

// Next.js App Router 전용 파일 컨벤션 — page.tsx의 데이터 페칭(await)이 끝날 때까지
// 이 파일이 Suspense fallback으로 자동 렌더링된다.
export default function Loading() {
  return <LoadingScreen />;
}
