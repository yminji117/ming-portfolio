---
name: project_phase2_code_review
description: "Phase 2 app-code review (2026-08-21) of /works, /study, /about, /here pages — guestbook Criticals confirmed fixed, Currently Doing slug-link gap still open, new XFF trust question"
metadata:
  type: project
---

Reviewed 2026-08-21 against `0a68375` ("Phase 2 하위 페이지(Works/Study/About/방명록) 구현") and the two prior commits. This supersedes the open status of [[project_phase2_guestbook_security_review]]: all 3 Critical trust-boundary bugs it found are now confirmed fixed in code — `0002_rls.sql`'s direct anon INSERT policy is dropped by `0009_guestbook_functions.sql:12`, IP is extracted server-side from `request.headers` (`guestbook_client_ip_hash()`), `guestbook_apply_update` re-verifies the password via `guestbook_verify` before writing, and `src/app/here/actions.ts` no longer passes `p_ip_hash` as a client param anywhere.

New/still-open findings:

1. **Currently Doing → Works/Study slug links still missing** (`src/components/currently-row.tsx`, `currently-doing-filterable-list.tsx`, both new in this commit) — renders `item.title` as plain text, no `<Link>`. `CurrentlyDoing` type in `src/lib/types.ts` has no `slug` field and `data.ts`'s `getCurrentlyDoing()` never joins `ref_id`/`ref_type` to `projects`/`studies`. This is the same gap [[project_phase2_readiness_review]] flagged before Phase 2 started — it carried through the entire Phase 2 implementation unaddressed, even though `/works/[slug]` and `/study/[slug]` now exist. Fix: join slug in `data.ts`, add `slug` to the type, wrap title in `<Link>` in both components.

2. **XFF leftmost-trust needs live verification** (`supabase/migrations/0009_guestbook_functions.sql:16-34`, `guestbook_client_ip_hash`) — uses `split_part(xff, ',', 1)` (leftmost value). This assumes Supabase's Kong gateway *overwrites* rather than *appends to* an externally-supplied `X-Forwarded-For` header. If Kong appends, a direct RPC caller (bypassing the Next.js app, using only the public anon key) can set an arbitrary leftmost XFF value on every call and rotate the resulting ip_hash, defeating the 60s/10-per-day rate limit and the 5-fail/10-min lockout — i.e., the same class of bug as the original Critical #3, just moved one layer down. Not confirmed exploitable from code alone; needs a live test against the actual Supabase deployment (call the RPC directly via curl/anon key with a spoofed XFF and see what `request.headers ->> 'x-forwarded-for'` actually resolves to).

3. Minor/defense-in-depth (not blocking): `data.ts` slug-lookup functions (`getProjectBySlug` etc.) rely entirely on RLS for the `status = 'published'` filter rather than also filtering in the query — fine today (anon key client, RLS is real boundary) but fragile if a service-role client is ever introduced. `content-blocks.tsx`'s `isYoutubeUrl` regex isn't hostname-anchored (low priority, body is admin-only input). Both `[slug]/page.tsx` routes call `generateMetadata` and the page component independently, duplicating the same DB fetch per request — wrap with React `cache()`.

Confirmed clean: no `dangerouslySetInnerHTML` anywhere in `content-blocks.tsx` (pure React text rendering); `guestbook_public` view + `GuestbookEntry` type structurally exclude `content`/`password_hash` from list responses; error-message string matching in `actions.ts` (`rate_limited`, `locked`, `invalid_credentials`) matches the DB's actual `raise exception` strings exactly.

**Why:** confirms the guestbook security fixes landed correctly (safe to close that finding), but surfaces that the Currently-Doing linking gap has now survived two full review cycles across Phase 1→Phase 2 without being scheduled — worth flagging explicitly to the user rather than letting it silently carry into Phase 3.

**How to apply:** before calling Phase 2 fully done, either fix or explicitly defer (with user sign-off) items 1 and 2 above. When `0009_guestbook_functions.sql` is finally applied to Supabase, test item 2 live before trusting the rate-limit/lockout guarantees.
