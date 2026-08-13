---
name: reference_prd_schema_sections
description: "Where to find DB schema, security, and admin auth requirements in PRD.md / PLAN.md for cross-checking migrations"
metadata:
  type: reference
---

This project keeps its product/security spec in `PRD.md` and design tokens/plan in `PLAN.md` at the repo root (not in `/docs`). SQL migration files cite PRD section numbers in comments (e.g. "PRD 8.2", "PRD 8.3", "PRD 9.1") — worth cross-referencing when reviewing schema or RLS changes, since the comments alone don't always match the actual constraint implementation.

Useful sections found so far:
- `PRD.md:57-61` — scope exclusions, incl. "다중 관리자 계정 및 권한 분리 (단일 운영자 전제)" — confirms single-admin-account assumption behind RLS design.
- `PRD.md:730-748` — `guestbook` table field list + "보안 정책 (필수)" (4 numbered security rules: public view column allowlist, anon SELECT blocked, password-gated content reveal via server action, admin = `authenticated` + admin role for full SELECT). `password_hash` is specified as bcrypt cost 10 (line 732).
- `PRD.md:783-793` — 8.3 "데이터 정합성 규칙" table (7 numbered rules): Main 노출 정원 (Professional 3 / Side 4 / Study 5), slug uniqueness, publish-time required fields, soft-delete retention (30 days), date-order constraint.
- `PRD.md:801-813` — 9.1 "인증 및 권한": single operator account, signups disabled (config-only, not in code), 7/30-day session, 5-fail lockout, `/admin/*` middleware protection.

**Why:** PRD is the source of truth for what the schema/RLS *should* do; several implementation gaps were only findable by cross-checking against it rather than reading the SQL in isolation. See [[project_phase0_supabase_review]] for the gaps found this way.

**How to apply:** when reviewing new migrations, admin features, or guestbook-related code in this project, grep `PRD.md` for the relevant section before concluding something is a bug vs. an intentional simplification.
