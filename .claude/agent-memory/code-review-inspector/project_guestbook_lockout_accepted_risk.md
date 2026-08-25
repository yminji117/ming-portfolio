---
name: project_guestbook_lockout_accepted_risk
description: "User explicitly declined restoring guestbook_verify brute-force lockout (2026-08-25) — do not re-report as blocking Critical in future reviews"
metadata:
  type: project
---

The Critical finding raised in this review cycle for commit 5ce49c7 — `0024_guestbook_remove_lockout.sql` strips the 5-fail/10-min lockout from `guestbook_verify`, leaving the anon-reachable password-check RPC (gate for guestbook edit/delete, and indirectly content reveal) unthrottled against brute force of 4-digit numeric passwords — was surfaced to the user directly. User's response: "잠금 로직 필요없습니다. 추후 필요하면 다시 요청할게요" (don't need the lockout, will ask again later if needed). This is a deliberate, informed risk acceptance for a low-stakes personal portfolio guestbook, not an oversight.

**Why:** avoid repeatedly re-flagging a known, user-accepted risk as if it were newly discovered or unresolved — this finding already went through 3 review cycles before the user made the call explicitly.

**How to apply:** in future reviews of this repo, do not list this as a Critical/blocking item or push back on merging because of it. A one-line "known accepted risk, see prior decision" mention is fine if directly relevant, but don't re-litigate it or ask the user to reconsider unless they bring it up or the threat model changes (real traffic, sensitive guestbook content, etc.). The dead `guestbook_auth_attempts` table (0009_guestbook_functions.sql:37) is still present if lockout is ever restored later.
