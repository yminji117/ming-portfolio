---
name: project_commit_5ce49c7_review
description: "Review of commit 5ce49c7 (2026-08-25, guestbook bugfixes + Currently Doing filter/load-more + Figma polish) — 1 new Critical (guestbook brute-force lockout removed), rest of guestbook fixes verified correct"
metadata:
  type: project
---

Reviewed 2026-08-25 against `git show 5ce49c7` (parent `a43dace`). Full detail on the guestbook findings lives in [[project_phase2_guestbook_security_review]] (updated in place) and the Currently Doing slug-link gap in [[project_phase2_readiness_review]] (3rd cycle confirmation). This file is the short pointer/summary for this specific commit.

Headline: the commit's own stated purpose ("방명록 등록/수정/삭제 버그 수정") — 6 migrations (0023-0028) fixing 4 sequential root causes of a guestbook insert/verify failure — is achieved correctly. But migration `0024_guestbook_remove_lockout.sql` also fully deleted `guestbook_verify`'s brute-force lockout (not just changed the ip-trust mechanism) with no replacement, and nothing in this commit or after reintroduces any throttling on that RPC. That's a real, currently-live Critical security regression, not just a theoretical one — see [[project_phase2_guestbook_security_review]] for exploit detail and fix suggestion.

Other areas checked, no issues found:
- `src/components/guestbook-list.tsx` (new edit/delete popup UX): no `dangerouslySetInnerHTML`, no XSS, no race conditions in optimistic state updates (only `updated_at` is patched into parent state on edit; raw `content` is intentionally never stored in the public list state, matching the "content stays private until password-verified" design). One cosmetic-only nit: password modal placeholder text says "4~12자" but the actual accepted range is 4~16 chars (matches `PASSWORD_PATTERN` in `src/app/here/actions.ts` and `guestbook-form.tsx`).
- `src/components/currently-doing-filterable-list.tsx` (new category/status filters + load-more/collapse): filter+pagination interaction and the load-more/collapse toggle logic are correct, no off-by-one found.
- Skimmed the Figma pixel-matching files (`full-career-timeline.tsx`, `section-heading.tsx`, `project-card.tsx`, `study-list-card.tsx`, `works-list-card.tsx`, `gnb.tsx`, `icons.tsx`, `format.ts`) — no new bugs. `gnb.tsx`'s previously-flagged focus-trap gap (see [[project_phase1_main_page_review]]) is untouched by this commit, still open, not regressed.

**Why:** keeps this commit's review self-contained and dated, since the guestbook memory file gets rewritten in place as fixes land and could otherwise lose the "this was found in 5ce49c7 specifically" provenance.

**How to apply:** before considering the guestbook feature launch-ready, the brute-force lockout regression must be fixed — treat as blocking, same severity class as the original 3 Critical findings from the Phase 2 launch review.
