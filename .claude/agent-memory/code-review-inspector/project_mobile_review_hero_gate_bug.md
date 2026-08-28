---
name: project_mobile_review_hero_gate_bug
description: "Mobile/responsive-path review (2026-08-28) — hero media dual-mount bug interacting with PageLoadGate, plus about/page.tsx TEMP debug leftover"
metadata:
  type: project
---

Reviewed mobile-facing code paths (2026-08-28): mobile-hero.tsx, hero.tsx, gnb.tsx, about-summary.tsx, app/about/page.tsx, study-section.tsx, works-professional-grid.tsx, currently-row.tsx, capabilities-section.tsx, loading-screen.tsx, project-gallery.tsx, admin-shell.tsx, here/page.tsx, guestbook-board/list/form.tsx.

**Critical finding (unresolved as of this review):** `src/components/hero.tsx` renders `<MobileHero>` (mobile branch, `lg:hidden`) and its own desktop `<HeroMedia>` (`hidden lg:block`) simultaneously in the DOM at all viewports — only CSS toggles visibility, both are always mounted. `src/components/hero-media.tsx`'s video branch hardcodes `autoPlay`/`preload="auto"` unconditionally (no visibility awareness), and the image branch hardcodes `priority` unconditionally. Default `hero_media_type` is `"video"` (`site-settings-form.tsx:19`, `app/page.tsx:58` fallback `?? "video"`), so on a typical page load there are **two** `<video>` elements in the DOM (one visible, one `display:none`).

`src/components/page-load-gate.tsx:28` (`waitForVideos`) does `document.querySelectorAll("video")` with no visibility filter, and waits for **all** of them to reach `readyState >= 2` (or fire `playing`/`loadeddata`) before revealing the page, falling back to a hard `VIDEO_READY_TIMEOUT_MS = 4000`ms timeout otherwise. Since many mobile browsers throttle/defer loading or autoplay for `display:none` video elements (power/data saving), the hidden desktop `<video>` may never fire its ready event promptly on mobile — meaning mobile visitors can be stuck on `LoadingScreen` for the full 4s on every load, waiting on a video they will never see. Confirmed by reading all four files together; not something visible from any single file in isolation.

Same dual-priority pattern also found in `src/app/about/page.tsx`: both the mobile photo `<Image>` (~line 49-55) and the desktop photo `<Image>` (~line 108-115) hardcode `priority`, so both eagerly download on every viewport (wasted mobile bandwidth on the desktop crop that's never shown, and vice versa).

**Also Critical (unrelated to mobile-hero bug, but shipping bug found in the same file):** `src/app/about/page.tsx` ~line 32-36 has a `// TEMP: 더보기 버튼 동작 확인용 ... 확인 끝나면 이 블록 제거` block that duplicates `currentlyDoing` into fake entries (`${item.id}-dup${i}`) and slices to 12, feeding `CurrentlyDoingSection`/`CurrentlyDoingFilterableList`. This is live in the file as of this review and would show fabricated duplicate rows to real visitors (mobile and desktop) on `/about`.

**Why:** these are concrete, verifiable functional/perf bugs specific to how this codebase does responsive design (CSS-only dual-render of both breakpoint branches, no JS viewport gating) — worth checking again after any hero/PageLoadGate/about-page changes to confirm they were fixed.

**How to apply:** before closing out any future hero.tsx / page-load-gate.tsx / about/page.tsx changes, verify (1) `PageLoadGate.waitForVideos` filters to only visible/relevant video(s), or the redundant off-breakpoint media element is no longer eagerly loaded, (2) the about/page.tsx TEMP dup-data block has been removed, (3) `priority` isn't set on both twin mobile+desktop media elements simultaneously. See [[project_phase1_main_page_review]] for the still-open gnb.tsx mobile menu focus-trap gap (Medium, unchanged in this pass).
