import localFont from "next/font/local";

// Figma '최종' 시안의 대형 헤딩(PORTFOLIO/Woke/Professionel/Study/Side/PROJECT)에 쓰인
// NanumSquare Neo Bold/ExtraBold. 본문은 기존 Pretendard를 그대로 쓴다.
export const nanumSquareNeo = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    {
      path: "../../node_modules/nanumsquareneo/woff2/NanumSquareNeoTTF-cBd.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../node_modules/nanumsquareneo/woff2/NanumSquareNeoTTF-dEb.woff2",
      weight: "800",
      style: "normal",
    },
  ],
});
