-- Works/Study 리스트 상단 고정 — "메인 노출"(is_featured)과는 별개 기능.
-- 정원 제한 없음(트리거 없음), 목록 정렬에서 pinned 그룹이 항상 위로 오도록 하는 용도.
alter table projects add column if not exists is_pinned boolean not null default false;
alter table studies add column if not exists is_pinned boolean not null default false;
