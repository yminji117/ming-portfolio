import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { CursorFollower } from "@/components/cursor-follower";
import { MotionProvider } from "@/components/motion-provider";
import { PageLoadGate } from "@/components/page-load-gate";
import { getSiteSettings } from "@/lib/data";
import { nanumSquareNeo } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  // 어드민에서 OG 이미지를 따로 안 정했으면 기본 로고를 대표 이미지로 쓴다.
  const ogImage = settings?.og_image_url ?? "/brand/logo.png";
  return {
    title: "MINJI",
    description: "MINJI 포트폴리오",
    metadataBase: new URL(
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000",
    ),
    openGraph: { title: "MINJI", description: "MINJI 포트폴리오", images: [ogImage] },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`h-full antialiased ${nanumSquareNeo.variable}`}>
      <body className="min-h-full flex flex-col">
        <AnalyticsTracker />
        {/* GA4는 자체 분석과 별개로 병행 — 측정 ID(env)가 있을 때만 로드. SPA 페이지뷰는
            GA4 향상된 측정(브라우저 기록 기반)이 자동 처리한다. */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <MotionProvider>
          <CursorFollower />
          <PageLoadGate>{children}</PageLoadGate>
        </MotionProvider>
      </body>
    </html>
  );
}
