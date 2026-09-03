-- 카테고리 관리: Work(Professional/Side) 업종 + Study 카테고리를 하나의 테이블로 통합.
-- 이후 새 카테고리는 어드민 "카테고리 관리"에서만 생성하고(등록 페이지 직접입력 폐지),
-- 이름은 곧 저장값이자 표시 라벨이라 별도 라벨 매핑이 필요 없어진다.
create table categories (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('work_professional', 'work_side', 'study')),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (scope, name)
);

alter table categories enable row level security;

create policy "public read categories"
  on categories for select
  to anon, authenticated
  using (true);

create policy "admin full access categories"
  on categories for all
  to authenticated
  using (true) with check (true);

-- 1) 기존 하드코딩 라벨 매핑을 실제 데이터에 소급 반영 — 이후 코드에서 라벨 매핑을 완전히 없애기 위함
update projects set industry = array_replace(industry, 'Education', 'EdTech') where 'Education' = any(industry);
update projects set industry = array_replace(industry, 'Brand', 'Brand Site') where 'Brand' = any(industry);
update studies set tags = array_replace(tags, 'Data', '데이터 분석') where 'Data' = any(tags);
update studies set tags = array_replace(tags, 'Talk', '말하기') where 'Talk' = any(tags);

-- 2) 기본 카테고리 seed (기존 DEFAULT_INDUSTRY_ORDER / DEFAULT_STUDY_CATEGORY_ORDER 순서 그대로)
insert into categories (scope, name, sort_order) values
  ('work_professional', 'EdTech', 0),
  ('work_professional', 'OTT', 1),
  ('work_professional', 'Commerce', 2),
  ('work_professional', 'Brand Site', 3),
  ('work_side', 'Community', 0),
  ('work_side', 'Popup', 1),
  ('work_side', 'Online', 2),
  ('work_side', 'Offline', 3),
  ('study', 'AI', 0),
  ('study', '데이터 분석', 1),
  ('study', '말하기', 2)
on conflict (scope, name) do nothing;

-- 3) 등록 페이지 "+ 직접 입력"으로 이미 쓰이고 있던 커스텀 값 backfill — 기본값 뒤에 이어 붙인다
insert into categories (scope, name, sort_order)
select 'work_professional', v, 100 + row_number() over ()
from (
  select distinct unnest(industry) as v from projects where category = 'professional' and deleted_at is null
) t
on conflict (scope, name) do nothing;

insert into categories (scope, name, sort_order)
select 'work_side', v, 100 + row_number() over ()
from (
  select distinct unnest(industry) as v from projects where category = 'side' and deleted_at is null
) t
on conflict (scope, name) do nothing;

insert into categories (scope, name, sort_order)
select 'study', v, 100 + row_number() over ()
from (
  select distinct unnest(tags) as v from studies where deleted_at is null
) t
where v not in ('Online', 'Offline')
on conflict (scope, name) do nothing;

-- 4) 순서는 이제 categories.sort_order가 대체 — site_settings의 구 컬럼 제거
alter table site_settings drop column industry_order;
alter table site_settings drop column study_category_order;
