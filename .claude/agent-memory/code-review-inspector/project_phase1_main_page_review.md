---
name: project_phase1_main_page_review
description: "Findings from Phase 1 (Main page UI) review (2026-08-13) — src/lib, src/components, src/app/page.tsx"
metadata:
  type: project
---

Phase 1 review (2026-08-13) covered `src/lib/{types,format,data}.ts`, all Main-page components under `src/components/`, and `src/app/{page,layout}.tsx` + `next.config.ts`. This was the first review pass for this code (all new since Phase 0). No Critical/security bugs found. Key functional findings worth tracking:

**Update (2026-08-20, Phase 2-readiness recheck): both items below are now fixed.** `src/app/page.tsx:39` now calls `getCurrentlyDoing(settings?.currently_limit ?? 6)`, and every `get*` in `src/lib/data.ts` now does `if (error) console.error(...)` before falling back. Confirmed by reading current file contents. See [[project_phase2_readiness_review]] for the newer pre-Phase-2 findings.

- ~~`site_settings.currently_limit` ... hardcodes `getCurrentlyDoing(6)`~~ FIXED.
- ~~`src/lib/data.ts` — every `get*` function ... discards `error` entirely~~ FIXED.
- `getFeaturedProjects`/`getFeaturedStudies` (`data.ts:18-42`) rely entirely on RLS + the `enforce_featured_cap` trigger to guarantee `is_featured=true` implies `status='published' and deleted_at is null`, rather than filtering explicitly in the query. Low real-world risk (single admin, trigger enforces the invariant at write time) but not self-evident from reading the query alone — low-priority defense-in-depth suggestion, not a live bug.
- `getCurrentlyDoing`'s sort logic (`data.ts:77-87`, label priority → start date, manual `order` wins when present) was checked carefully per the request — **no logic bug found**, matches PRD 5.7 intent and produces a consistent total order.
- `src/components/hero.tsx:84` uses `title.split("")` for the per-character stagger animation, which breaks multi-code-unit characters (emoji, combining marks) — low risk since hero title is expected to be plain Korean/English text, but `Array.from(title)` is the safer choice if emoji ever get used in the hero title.
- Mobile nav overlay (`src/components/gnb.tsx:111-135`) has no focus trap — user already knows this, asked only for severity assessment. Rated Medium: keyboard/screen-reader users can Tab past the visible full-screen overlay onto page content hidden behind it, but Escape-to-close and click-through don't break, so it's a real but non-blocking accessibility gap.

**Why:** first review pass of Phase 1 code — useful to check whether these were addressed by the time Phase 2 (admin panel) or Phase 3 ships, especially the `currently_limit` dead setting and the swallowed-error pattern in `data.ts` (which is a reusable pattern likely to be copy-pasted into future data-fetching code).

**How to apply:** when reviewing Phase 2/3 (admin CRUD, detail pages), check (1) whether `currently_limit` is actually wired up end-to-end once its admin UI ships, (2) whether new `data.ts`-style fetch functions repeat the swallowed-`error` pattern — if so it's a systemic convention in this codebase, not a one-off. See [[project_phase0_supabase_review]] for the earlier DB-layer findings.
