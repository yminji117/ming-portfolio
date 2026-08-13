---
name: project_phase1_main_page_review
description: "Findings from Phase 1 (Main page UI) review (2026-08-13) — src/lib, src/components, src/app/page.tsx"
metadata:
  type: project
---

Phase 1 review (2026-08-13) covered `src/lib/{types,format,data}.ts`, all Main-page components under `src/components/`, and `src/app/{page,layout}.tsx` + `next.config.ts`. This was the first review pass for this code (all new since Phase 0). No Critical/security bugs found. Key functional findings worth tracking:

- `site_settings.currently_limit` (admin-configurable "how many Currently Doing items to show") is defined in the schema and in `src/lib/types.ts:86`, and `getSiteSettings()` fetches it — but `src/app/page.tsx:33` hardcodes `getCurrentlyDoing(6)` instead of `getCurrentlyDoing(settings?.currently_limit ?? 6)`. The admin setting is fetched and then silently ignored. Not visible yet since no admin UI exists to change it, but will look like a broken setting once Phase 2/3 ships admin CRUD for `site_settings`. Worth checking this is fixed before/when the admin settings screen for `currently_limit` ships.
- `src/lib/data.ts` — every `get*` function destructures only `data` from the Supabase response and discards `error` entirely (e.g. lines 14, 23-30, 35-42, 46, 52-58, 69-72). On any real Supabase error (RLS misconfig, network blip, schema drift) the page silently renders as if the section had 0 rows, with zero server-side logging. Worth revisiting if "why is section X missing in prod" debugging ever comes up — the fix is just `console.error(error)` before returning the fallback, no behavior change needed since sections already handle 0-length gracefully.
- `getFeaturedProjects`/`getFeaturedStudies` (`data.ts:18-42`) rely entirely on RLS + the `enforce_featured_cap` trigger to guarantee `is_featured=true` implies `status='published' and deleted_at is null`, rather than filtering explicitly in the query. Low real-world risk (single admin, trigger enforces the invariant at write time) but not self-evident from reading the query alone — low-priority defense-in-depth suggestion, not a live bug.
- `getCurrentlyDoing`'s sort logic (`data.ts:77-87`, label priority → start date, manual `order` wins when present) was checked carefully per the request — **no logic bug found**, matches PRD 5.7 intent and produces a consistent total order.
- `src/components/hero.tsx:84` uses `title.split("")` for the per-character stagger animation, which breaks multi-code-unit characters (emoji, combining marks) — low risk since hero title is expected to be plain Korean/English text, but `Array.from(title)` is the safer choice if emoji ever get used in the hero title.
- Mobile nav overlay (`src/components/gnb.tsx:111-135`) has no focus trap — user already knows this, asked only for severity assessment. Rated Medium: keyboard/screen-reader users can Tab past the visible full-screen overlay onto page content hidden behind it, but Escape-to-close and click-through don't break, so it's a real but non-blocking accessibility gap.

**Why:** first review pass of Phase 1 code — useful to check whether these were addressed by the time Phase 2 (admin panel) or Phase 3 ships, especially the `currently_limit` dead setting and the swallowed-error pattern in `data.ts` (which is a reusable pattern likely to be copy-pasted into future data-fetching code).

**How to apply:** when reviewing Phase 2/3 (admin CRUD, detail pages), check (1) whether `currently_limit` is actually wired up end-to-end once its admin UI ships, (2) whether new `data.ts`-style fetch functions repeat the swallowed-`error` pattern — if so it's a systemic convention in this codebase, not a one-off. See [[project_phase0_supabase_review]] for the earlier DB-layer findings.
