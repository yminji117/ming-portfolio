import type { Metadata } from "next";
import { MotionProvider } from "@/components/motion-provider";
import { PageLoadGate } from "@/components/page-load-gate";
import { getSiteSettings } from "@/lib/data";
import { nanumSquareNeo } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "MINJI",
    description: "MINJI 포트폴리오",
    openGraph: settings?.og_image_url
      ? { title: "MINJI", description: "MINJI 포트폴리오", images: [settings.og_image_url] }
      : undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`h-full antialiased ${nanumSquareNeo.variable}`}>
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          <PageLoadGate>{children}</PageLoadGate>
        </MotionProvider>
      </body>
    </html>
  );
}
