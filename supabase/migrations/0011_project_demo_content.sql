-- MINJI 포트폴리오 — Works 화면 디자인 확인용 데모 콘텐츠 백필
-- 0010에서 추가한 컬럼들은 전부 nullable이라 값이 없으면 화면에서 해당 섹션이 그냥 숨겨진다.
-- Figma '최종' 시안과 대조 확인이 가능하도록, 기존 시드 문구('프로젝트 개요' 등)와 같은 톤의
-- 자리표시용 텍스트로 채워둔다 — 실제 콘텐츠는 나중에(Phase 3 어드민 또는 콘솔에서) 교체하면 된다.
-- ⚠️ 0010_project_detail_fields.sql을 먼저 적용해야 이 파일이 정상 실행된다.

-- 1) Side 프로젝트 industry — /works Side 탭 필터 칩(Community/Popup/Online/Offline)이
--    실제 데이터 기반으로 노출되도록 채운다 (Professional의 0005 마이그레이션과 동일한 패턴).
update projects set industry = 'Community' where slug = 'side-project-1';
update projects set industry = 'Popup' where slug = 'side-project-2';
update projects set industry = 'Online' where slug = 'side-project-3';
update projects set industry = 'Offline' where slug = 'side-project-4';

-- 2) Professional 상세 페이지 신규 섹션(기여도/역할 설명/주요 업무/성과/회고) 데모 값
update projects set
  role_note = '프로젝트 개요',
  contribution_percent = 80,
  main_tasks = array['주요 업무', '주요 업무'],
  result = '성과 결과',
  retrospective = '회고 회고'
where slug = 'professional-project-1';

update projects set
  role_note = '프로젝트 개요',
  contribution_percent = 60,
  main_tasks = array['주요 업무', '주요 업무'],
  result = '성과 결과',
  retrospective = '회고 회고'
where slug = 'professional-project-2';

update projects set
  role_note = '프로젝트 개요',
  contribution_percent = 100,
  main_tasks = array['주요 업무', '주요 업무'],
  result = '성과 결과',
  retrospective = '회고 회고'
where slug = 'professional-project-3';

update projects set
  role_note = '프로젝트 개요',
  contribution_percent = 40,
  main_tasks = array['주요 업무', '주요 업무'],
  result = '성과 결과',
  retrospective = '회고 회고'
where slug = 'professional-project-4';

update projects set
  role_note = '프로젝트 개요',
  contribution_percent = 90,
  main_tasks = array['주요 업무', '주요 업무'],
  result = '성과 결과',
  retrospective = '회고 회고'
where slug = 'professional-project-5';

-- gallery_urls(하단 IMAGE 갤러리)는 실제 이미지 자산이 없어 이번엔 채우지 않는다 —
-- Supabase Storage에 이미지를 올린 뒤 URL 배열로 채우면 해당 섹션이 나타난다.
