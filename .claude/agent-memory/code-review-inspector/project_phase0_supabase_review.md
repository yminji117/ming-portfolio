---
name: project_phase0_supabase_review
description: "Findings from Phase 0 Supabase schema/RLS review (2026-08-13) — status as of Phase 1 recheck"
metadata:
  type: project
---

Phase 0 review (2026-08-13) of `supabase/migrations/0001_init.sql`, `0002_rls.sql`, `supabase/seed.sql` found several gaps between `PRD.md` and the schema/RLS. **Update (2026-08-13, Phase 1 recheck): all items below were verified fixed** via `0003_fixes.sql` + `0004_currently_doing_order_fix.sql`, and the fixes are also baked back into `0001_init.sql` itself (source-of-truth for fresh installs) — confirmed by reading the current file contents, not just trusting the migration comments.

Verified-fixed items:
- guestbook column-scope gap: `guestbook_lock_visitor_fields()` trigger now force-resets `is_read`/`is_hidden`/`flag`/`admin_memo` on every INSERT (`0001_init.sql:145-158`). Confirmed present.
- `enforce_featured_cap()` now fails closed: unknown `project_category` raises an exception instead of silently skipping the cap (`0001_init.sql:226-234`). Confirmed present.
- `careers`/`currently_doing` now have `end_date >= start_date` CHECK constraints matching `projects` (`0001_init.sql:96`, `:122`). Confirmed present.
- Seed guestbook password hashes now use `crypt('1234', gen_salt('bf', 10))` (bcrypt cost 10 per PRD 8.2/732) — confirmed in `0003_fixes.sql:90-91`.
- `currently_doing.order` seed data reset to null so default auto-sort (label→date) isn't hidden by leftover manual order values (`0004_currently_doing_order_fix.sql`). Confirmed.

Still-open, not-yet-addressed (low priority, noted in original review, no fix migration exists for these — OK to leave for now):
- `0001_init.sql` still not safe to re-run (no `if not exists`/`drop if exists` guards on `create type`/`create table`). Low priority — only matters if someone re-runs it against an existing DB.
- `projects.summary not null` vs `studies.summary` nullable inconsistency (PRD 8.3 rule #5 says summary should only be required at publish time) — not fixed, still worth addressing before a "save draft" admin flow ships in Phase 2/3.
- Admin-account-is-the-only-`authenticated`-user assumption still lives only in Supabase dashboard config, unverifiable from code — must be confirmed manually before go-live.

**Why:** avoids re-deriving these from scratch on every review pass. See [[project_phase1_main_page_review]] for the newer Phase 1 (Main page UI) findings.

**How to apply:** the two "still-open" items above are worth flagging again if Phase 2/3 touches the admin draft-save flow or migration tooling. Everything else in the original Phase 0 review can be considered closed.
