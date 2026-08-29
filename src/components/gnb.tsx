"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";

const NAV_LINKS = [
  { label: "Work", href: "/works", match: "/works" },
  { label: "Study", href: "/study", match: "/study" },
  { label: "About me", href: "/about", match: "/about" },
];

// Works/Study 상세 페이지에서는 모바일 GNB의 로고를 Back 버튼으로 대체한다.
const DETAIL_PAGE_PATTERN = /^\/(works|study)\/[^/]+$/;

export function Gnb() {
  const pathname = usePathname();
  const router = useRouter();
  const isDetailPage = DETAIL_PAGE_PATTERN.test(pathname);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const prevY = lastY.current;
      lastY.current = y;

      // 하단으로 스크롤하면 기존처럼 80px만 넘어도 바로 숨긴다.
      if (y > prevY && y > 80) {
        setHidden(true);
        return;
      }
      // 맨 위 근처로 돌아오면 항상 보여준다.
      if (y <= 80) {
        setHidden(false);
        return;
      }
      // 그 사이(80px ~ 한 화면 높이)에서 위로 스크롤한 경우는 재등장시키지 않는다 —
      // 각 페이지 최상단 히어로 이미지가 이 구간에 있어서, 여기서 바로 재등장시키면
      // 반투명 헤더가 히어로 이미지 위에 겹쳐 상단 라운드 코너가 잘려 보인다.
      // 한 화면 높이를 넘겨 스크롤을 더 올린 뒤에만(히어로가 완전히 지나간 뒤) 재등장.
      if (y < prevY && y > window.innerHeight) {
        setHidden(false);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-white/25 bg-white/55 shadow-[0px_2px_4px_rgba(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <nav
          aria-label="주요 메뉴"
          className="container-app grid h-16 grid-cols-2 items-center text-[var(--color-text)] lg:h-[60px] lg:grid-cols-[1fr_auto_1fr]"
        >
          <div className="justify-self-start">
            {isDetailPage && (
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="뒤로 가기"
                className="lg:hidden"
              >
                <ArrowRightIcon className="size-6 rotate-180" />
              </button>
            )}
            <Link
              href="/"
              aria-label="MINJI"
              className={isDetailPage ? "hidden lg:block" : undefined}
            >
              <Image
                src="/brand/logo.png"
                alt="MINJI"
                width={177}
                height={89}
                priority
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="hidden items-center gap-8 justify-self-center lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] ${
                  pathname.startsWith(link.match)
                    ? "font-semibold text-[var(--color-accent)]"
                    : "text-[var(--color-text)] hover:text-[var(--color-accent)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden justify-self-end lg:flex">
            <Link
              href="/here"
              className="group inline-flex items-center gap-1.5 rounded-[4px] bg-[var(--color-accent)] px-4 py-2 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:scale-[1.02] active:scale-[0.98]"
            >
              here
              <span className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>

          <button
            type="button"
            className="flex flex-col gap-1.5 justify-self-end lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className={`block h-0.5 w-6 bg-current transition-transform duration-[var(--dur-fast)] ${
                menuOpen ? "translate-y-1 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-transform duration-[var(--dur-fast)] ${
                menuOpen ? "-translate-y-1 -rotate-45" : ""
              }`}
            />
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-center bg-[var(--color-bg)] px-8 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/here"
              onClick={() => setMenuOpen(false)}
              className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-[var(--color-accent)]"
            >
              here →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
