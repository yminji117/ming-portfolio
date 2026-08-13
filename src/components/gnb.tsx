"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Works", href: "/works", match: "/works" },
  { label: "Study", href: "/study", match: "/study" },
  { label: "About me", href: "/about", match: "/about" },
];

export function Gnb() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-bg)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${scrolled ? "shadow-[0_1px_0_rgba(19,20,23,0.04)]" : ""}`}
      >
        <nav
          aria-label="주요 메뉴"
          className="container-app flex h-16 items-center justify-between text-[var(--color-text)] lg:h-20"
        >
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight"
          >
            MINJI
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
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
            <Link
              href="/here"
              className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] px-5 py-2 text-[length:var(--fs-body)] font-medium text-[var(--color-accent-ink)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:scale-[1.02] active:scale-[0.98]"
            >
              here
              <span className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>

          <button
            type="button"
            className="flex flex-col gap-1.5 lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className={`block h-0.5 w-6 bg-current transition-transform duration-[var(--dur-fast)] ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-transform duration-[var(--dur-fast)] ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
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
                className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/here"
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
