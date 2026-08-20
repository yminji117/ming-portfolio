import type { Metadata } from "next";
import { MotionProvider } from "@/components/motion-provider";
import { PageLoadGate } from "@/components/page-load-gate";
import { nanumSquareNeo } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINJI",
  description: "MINJI 포트폴리오",
};

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
