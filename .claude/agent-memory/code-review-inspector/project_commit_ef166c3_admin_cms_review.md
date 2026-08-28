---
name: project_commit_ef166c3_admin_cms_review
description: "Review of commit ef166c3 (Phase 3 admin CMS: about/currently-doing/site-settings/media/trash pages) — findings and one open bug"
metadata:
  type: project
---

Reviewed the Phase 3 admin CMS expansion (about, currently-doing, site-settings, media, trash pages; proxy.ts maintenance-mode rewrite; mobile guard in admin-shell.tsx). Note: this sub-agent had no Bash/git tool available, so the review was done by reading current working-tree file contents (which matched the described diff scope), not `git diff 463a544..ef166c3` directly — flagged this limitation to the user.

Key findings:
- All new server actions (works/studies/guestbook/about/site-settings/currently-doing/media `actions.ts`) consistently call `requireAdmin()` before any mutation — no gaps found.
- `deleteProject`/`deleteStudy` now correctly unset `is_featured`/`featured_order` on soft-delete, and `getFeaturedProjects`/`getFeaturedStudies` in `src/lib/data.ts` now have `.is("deleted_at", null)` — this previously-tracked bug (see [[project_phase2_readiness_review]]) is confirmed fixed.
- Real bug found: `reorderCurrentlyDoing` (src/app/admin/(protected)/currently-doing/actions.ts) + `CurrentlyDoingEditor` (src/components/admin/currently-doing-editor.tsx) — the up/down move buttons are not disabled for unsaved "new-<uuid>" rows, so reordering a list that includes an unsaved row sends a non-UUID id to `.update({order}).eq("id", id)` against a `uuid` PK column, which fails with a Postgres cast error for that row while the *other* rows' updates (parallel `Promise.all`, not transactional) still commit — user sees a generic failure message even though partial reordering succeeded. Fix: filter `isNew` rows out of the reordered id list, or disable move buttons for `row.isNew`.
- `admin-shell.tsx` mobile guard (`hidden lg:flex` CSS classes below 1024px, except `/admin/guestbook`) is confirmed to be a layout/UX guard only — server-rendered children (and their fetched data) are still present in the HTML/RSC payload for narrow viewports, just hidden via CSS. This is not a security boundary, but since only the already-authenticated single admin ever sees it, this is not a vulnerability — matches the intent documented in the component's own comments.
- `deleteMediaFile(path)` (media/actions.ts) takes a raw client-supplied path with no validation, but Supabase Storage keys aren't filesystem paths (no real ".." traversal), and the bucket-scoped RLS + single-trusted-admin model mean this is only a defense-in-depth gap, not an exploitable vuln.
- `list-media.ts` recursive bucket walk uses `.list(prefix, { limit: 1000 })` with no offset pagination — folders with >1000 objects would silently truncate with no indication in the UI. Low priority at current/expected scale.
- `proxy.ts` maintenance-mode check (`checkMaintenanceMode()`) runs a live Supabase query on every single non-admin request (no caching), and the broad matcher also covers non-page routes (e.g. generated `robots.txt`/`sitemap.xml`, and POST server-action requests to public pages like the guestbook form) — during an active maintenance window, submitting a public-page server action would likely hit the mid-flight `NextResponse.rewrite` before the action executes, possibly surfacing a raw Next.js error instead of a friendly maintenance message. Worth a manual test if maintenance mode will actually be used for windows where visitors might have an in-flight form submission.

**Why:** captures a real, reproducible logic bug (reorder + unsaved row) worth fixing, and separates it from several already-considered/accepted "issues" (media path validation, CSS-only mobile guard, recursion depth) that don't rise above informational for a single-admin trusted-user project.

**How to apply:** in future reviews of `currently-doing-editor.tsx` or similar list-reorder UIs in this repo, check whether unsaved/new rows are excluded from reorder id arrays before flagging it again if still unfixed. Don't re-flag the mobile guard or deleteMediaFile path validation as security issues — they were deliberately assessed as informational only.
