-- MINJI 포트폴리오 — 초기 스키마 (PRD 8.2)
-- project_blocks/study_blocks는 PRD 8.2 대안에 따라 각 테이블의 단일 jsonb `body` 컬럼으로 대체

create extension if not exists "pgcrypto";

-- Enums
create type project_category as enum ('professional', 'side');
create type content_status as enum ('draft', 'published');
create type career_type as enum ('school', 'language', 'company');
create type skill_group as enum ('main', 'sub');
create type currently_category as enum ('works', 'study', 'side');
create type currently_label as enum ('want', 'doing', 'done');
create type currently_ref_type as enum ('project', 'study', 'none');
create type guestbook_flag as enum ('normal', 'hold', 'spam');
create type media_type as enum ('image', 'video', 'file');
create type hero_media_type as enum ('image', 'video');

-- projects (Works: Professional / Side 공통)
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category project_category not null,
  title text not null,
  summary text not null,
  thumbnail_url text,
  cover_url text,
  start_date date,
  end_date date,
  company text,
  role text[] not null default '{}',
  tools text[] not null default '{}',
  team text,
  external_url text,
  overview text,
  result text,
  body jsonb,
  industry text,
  is_featured boolean not null default false,
  featured_order int,
  status content_status not null default 'draft',
  view_count int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_date_order check (end_date is null or start_date is null or end_date >= start_date)
);

create index projects_category_featured_idx on projects (category, is_featured, featured_order) where deleted_at is null;

-- studies
create table studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  thumbnail_url text,
  tags text[] not null default '{}',
  external_url text,
  published_at date not null default current_date,
  body jsonb,
  is_featured boolean not null default false,
  featured_order int,
  status content_status not null default 'draft',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index studies_featured_idx on studies (is_featured, featured_order) where deleted_at is null;

-- about (singleton)
create table about (
  id boolean primary key default true check (id),
  photo_url text,
  name_ko text,
  name_en text,
  tagline text,
  cover_letter text,
  cover_letter_summary text,
  email text,
  instagram_url text,
  resume_url text,
  updated_at timestamptz not null default now()
);

-- careers (학교 / 어학연수 / 회사)
create table careers (
  id uuid primary key default gen_random_uuid(),
  type career_type not null,
  org_name text not null,
  title text,
  start_date date,
  end_date date,
  description text,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  constraint careers_date_order check (end_date is null or start_date is null or end_date >= start_date)
);

-- skills
create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_url text,
  "group" skill_group not null default 'main',
  "order" int not null default 0
);

-- currently_doing
create table currently_doing (
  id uuid primary key default gen_random_uuid(),
  category currently_category not null,
  title text not null,
  label currently_label not null,
  start_date date,
  end_date date,
  ref_type currently_ref_type not null default 'none',
  ref_id uuid,
  is_visible boolean not null default true,
  "order" int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint currently_doing_date_order check (end_date is null or start_date is null or end_date >= start_date)
);

-- guestbook ⚠️ 보안 핵심 — content/password_hash는 anon에게 절대 노출 금지 (0002_rls.sql 참고)
create table guestbook (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  content text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_read boolean not null default false,
  is_hidden boolean not null default false,
  flag guestbook_flag not null default 'normal',
  admin_memo text,
  ip_hash text,
  user_agent text,
  deleted_at timestamptz
);

-- RLS의 INSERT with check(true)는 행 단위 허용일 뿐 컬럼 단위 제한이 아니므로,
-- anon이 nickname/content/password_hash 외에 운영자 전용 필드(is_read/is_hidden/flag/admin_memo)를
-- 임의로 채워 넣을 수 있다. INSERT 시 해당 필드를 서버가 강제로 초기값으로 되돌린다.
create or replace function guestbook_lock_visitor_fields()
returns trigger as $$
begin
  new.is_read := false;
  new.is_hidden := false;
  new.flag := 'normal';
  new.admin_memo := null;
  return new;
end;
$$ language plpgsql;

create trigger guestbook_lock_visitor_fields
  before insert on guestbook
  for each row execute function guestbook_lock_visitor_fields();

-- guestbook_revisions (수정 이력 스냅샷)
create table guestbook_revisions (
  id uuid primary key default gen_random_uuid(),
  guestbook_id uuid not null references guestbook (id) on delete cascade,
  prev_content text not null,
  revised_at timestamptz not null default now()
);

-- site_settings (singleton)
create table site_settings (
  id boolean primary key default true check (id),
  hero_title text not null default 'Welcome To My Home',
  hero_subtitle text,
  hero_image_url text,
  hero_video_url text,
  hero_media_type hero_media_type not null default 'image',
  currently_limit int not null default 6,
  footer_text text,
  og_image_url text,
  is_maintenance boolean not null default false,
  updated_at timestamptz not null default now()
);

-- media (업로드 자산 공통 관리)
create table media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  type media_type not null,
  file_name text,
  size int,
  width int,
  height int,
  alt text,
  uploaded_at timestamptz not null default now()
);

-- updated_at 자동 갱신
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_touch before update on projects for each row execute function set_updated_at();
create trigger studies_touch before update on studies for each row execute function set_updated_at();
create trigger currently_doing_touch before update on currently_doing for each row execute function set_updated_at();
create trigger about_touch before update on about for each row execute function set_updated_at();
create trigger site_settings_touch before update on site_settings for each row execute function set_updated_at();

-- PRD 8.3 데이터 정합성 규칙: Main 노출 정원(Professional 3 / Side 4 / Study 5) + draft는 is_featured 불가
create or replace function enforce_featured_cap()
returns trigger as $$
declare
  cap int;
  current_count int;
begin
  if new.is_featured is distinct from true then
    return new;
  end if;

  if new.status is distinct from 'published' then
    raise exception 'draft 상태는 is_featured를 설정할 수 없습니다';
  end if;

  if TG_TABLE_NAME = 'projects' then
    cap := case new.category
      when 'professional' then 5
      when 'side' then 2
      else null
    end;
    if cap is null then
      raise exception '알 수 없는 project category: %', new.category;
    end if;
    select count(*) into current_count from projects
      where category = new.category
        and is_featured = true
        and deleted_at is null
        and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000');
  elsif TG_TABLE_NAME = 'studies' then
    cap := 4;
    select count(*) into current_count from studies
      where is_featured = true
        and deleted_at is null
        and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000');
  else
    raise exception 'enforce_featured_cap: 지원하지 않는 테이블 %', TG_TABLE_NAME;
  end if;

  if current_count >= cap then
    raise exception '% 노출 정원(%)을 초과했습니다', TG_TABLE_NAME, cap;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger projects_featured_cap before insert or update on projects
  for each row execute function enforce_featured_cap();
create trigger studies_featured_cap before insert or update on studies
  for each row execute function enforce_featured_cap();
