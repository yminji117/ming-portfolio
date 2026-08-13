-- MINJI 포트폴리오 — RLS 정책 (PRD 8.2 guestbook 보안 정책, 10.4)
-- 원칙: anon(방문자)은 published/공개 데이터만 SELECT, guestbook은 INSERT만 가능
--       authenticated(단일 운영자 계정)는 전 테이블 전체 권한
-- 이 스크립트는 재실행해도 안전하도록 각 정책을 drop 후 재생성한다.

alter table projects enable row level security;
alter table studies enable row level security;
alter table about enable row level security;
alter table careers enable row level security;
alter table skills enable row level security;
alter table currently_doing enable row level security;
alter table guestbook enable row level security;
alter table guestbook_revisions enable row level security;
alter table site_settings enable row level security;
alter table media enable row level security;

-- 방문자 공개 SELECT
drop policy if exists "public read published projects" on projects;
create policy "public read published projects"
  on projects for select
  to anon, authenticated
  using (status = 'published' and deleted_at is null);

drop policy if exists "public read published studies" on studies;
create policy "public read published studies"
  on studies for select
  to anon, authenticated
  using (status = 'published' and deleted_at is null);

drop policy if exists "public read about" on about;
create policy "public read about"
  on about for select
  to anon, authenticated
  using (true);

drop policy if exists "public read careers" on careers;
create policy "public read careers"
  on careers for select
  to anon, authenticated
  using (true);

drop policy if exists "public read skills" on skills;
create policy "public read skills"
  on skills for select
  to anon, authenticated
  using (true);

drop policy if exists "public read visible currently_doing" on currently_doing;
create policy "public read visible currently_doing"
  on currently_doing for select
  to anon, authenticated
  using (is_visible = true);

drop policy if exists "public read site_settings" on site_settings;
create policy "public read site_settings"
  on site_settings for select
  to anon, authenticated
  using (true);

-- guestbook ⚠️ 최우선 보안 요구사항
-- anon은 INSERT만 허용, SELECT 정책을 두지 않아 content/password_hash를 포함한 직접 조회는 RLS로 전면 차단된다.
-- 목록 노출은 아래 guestbook_public 뷰(정의자 권한으로 실행되어 지정 컬럼만 노출)를 통해서만 이루어진다.
drop policy if exists "anyone can insert guestbook entry" on guestbook;
create policy "anyone can insert guestbook entry"
  on guestbook for insert
  to anon, authenticated
  with check (true);

revoke select on guestbook from anon;

create or replace view guestbook_public
with (security_invoker = false) as
  select id, nickname, created_at, updated_at
  from guestbook
  where is_hidden = false and deleted_at is null
  order by created_at desc;

grant select on guestbook_public to anon, authenticated;

-- 어드민(단일 운영자, authenticated) 전체 권한
-- v1.0은 단일 관리자 계정 전제이므로 authenticated = 관리자로 취급한다 (PRD 9.1)
drop policy if exists "admin full access projects" on projects;
create policy "admin full access projects"
  on projects for all to authenticated
  using (true) with check (true);

drop policy if exists "admin full access studies" on studies;
create policy "admin full access studies"
  on studies for all to authenticated
  using (true) with check (true);

drop policy if exists "admin full access about" on about;
create policy "admin full access about"
  on about for all to authenticated
  using (true) with check (true);

drop policy if exists "admin full access careers" on careers;
create policy "admin full access careers"
  on careers for all to authenticated
  using (true) with check (true);

drop policy if exists "admin full access skills" on skills;
create policy "admin full access skills"
  on skills for all to authenticated
  using (true) with check (true);

drop policy if exists "admin full access currently_doing" on currently_doing;
create policy "admin full access currently_doing"
  on currently_doing for all to authenticated
  using (true) with check (true);

drop policy if exists "admin full access guestbook" on guestbook;
create policy "admin full access guestbook"
  on guestbook for all to authenticated
  using (true) with check (true);

drop policy if exists "admin full access guestbook_revisions" on guestbook_revisions;
create policy "admin full access guestbook_revisions"
  on guestbook_revisions for all to authenticated
  using (true) with check (true);

drop policy if exists "admin full access site_settings" on site_settings;
create policy "admin full access site_settings"
  on site_settings for all to authenticated
  using (true) with check (true);

drop policy if exists "admin full access media" on media;
create policy "admin full access media"
  on media for all to authenticated
  using (true) with check (true);
