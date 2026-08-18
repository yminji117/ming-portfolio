-- MINJI 포트폴리오 — Figma '최종' 메인 디자인 반영
-- 1) Works Professional 업종 필터용 자유 텍스트 컬럼 추가
-- 2) Main 노출 정원 변경: Professional 3→5 / Side 4→2 / Study 5→4 (0001_init.sql도 동일하게 갱신됨)
-- 0001_init.sql / seed.sql 소스 파일 자체도 신규 환경 세팅을 위해 동일 내용으로 갱신해두었다.

-- 1) projects.industry — Works Professional 필터 칩은 실제 등록된 값 기반으로 자동 생성된다.
alter table projects add column if not exists industry text;

-- 2) enforce_featured_cap 캡 변경
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

-- 3) 캡이 줄어든 side/study는, 기존에 이미 정원을 초과해 featured로 들어가 있던 시드 행을
--    먼저 un-feature 해두지 않으면 이후 해당 행을 저장할 때마다(is_featured=true 유지 상태로 update)
--    트리거가 "정원 초과"로 막아버린다. featured_order 상위 N개만 남기고 나머지는 해제한다.
update studies
set is_featured = false, featured_order = null
where is_featured = true
  and id not in (
    select id from studies
    where is_featured = true
    order by featured_order asc nulls last
    limit 4
  );

update projects
set is_featured = false, featured_order = null
where category = 'side'
  and is_featured = true
  and id not in (
    select id from projects
    where category = 'side' and is_featured = true
    order by featured_order asc nulls last
    limit 2
  );

-- 4) Works Professional 필터 데모용 industry 값 부여 (Figma 필터 칩: Education/OTT/Commerce/Brand)
update projects set industry = 'OTT' where slug = 'professional-project-1';
update projects set industry = 'Education' where slug = 'professional-project-2';
update projects set industry = 'Commerce' where slug = 'professional-project-3';

-- 5) 정원이 3→5로 늘어났으므로, 필터 칩(Education/Brand)이 모두 매칭 예시를 가지도록 2건 추가
insert into projects (slug, category, title, summary, company, role, tools, industry, start_date, overview, is_featured, featured_order, status)
values
  ('professional-project-4', 'professional', 'Professional 프로젝트 4', '한 줄 요약을 입력해주세요', '회사명 B', array['기획','UX'], array['Figma'], 'Education', '2022-01-01', '프로젝트 개요', true, 4, 'published'),
  ('professional-project-5', 'professional', 'Professional 프로젝트 5', '한 줄 요약을 입력해주세요', '회사명 A', array['기획'], array['Notion'], 'Brand', '2021-06-01', '프로젝트 개요', true, 5, 'published')
on conflict (slug) do nothing;

-- 6) Study 로드맵 카드 데모 — study-1에 단계별 본문 저장 (없으면 기존처럼 단순 카드로 렌더링됨)
update studies
set body = '{
  "steps": [
    {"label": "1단계", "text": "데이터로 생각하기 시작하기"},
    {"label": "2단계", "text": "측정 가능한 질문과 지표 만들기"},
    {"label": "3단계", "text": "행동 가능한 인사이트 뽑기"},
    {"label": "4단계", "text": "데이터 스토리텔링으로 팀 설득하기"},
    {"label": "5단계", "text": "내 데이터 판단력 완성하기"}
  ]
}'::jsonb
where slug = 'study-1';
