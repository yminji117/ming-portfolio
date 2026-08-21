-- MINJI 포트폴리오 — Works 상세 페이지 Figma '최종' 시안 반영
-- 상세 페이지에만 쓰이는 필드 5종 추가: 기여도(%), 역할 설명, 주요 업무(불릿), 회고, 이미지 갤러리

alter table projects add column if not exists contribution_percent smallint
  check (contribution_percent is null or (contribution_percent between 0 and 100));

alter table projects add column if not exists role_note text;

alter table projects add column if not exists main_tasks text[];

alter table projects add column if not exists retrospective text;

alter table projects add column if not exists gallery_urls text[];
