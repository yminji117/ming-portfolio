import type { Metadata } from "next";
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
        <MotionProvider>
          <CursorFollower />
          <PageLoadGate>{children}</PageLoadGate>
        </MotionProvider>
      </body>
    </html>
  );
}
