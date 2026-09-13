-- 상세 페이지 "바로가기" 버튼 표시 문구를 프로젝트/스터디별로 커스터마이즈.
-- 비워두면(null) 프론트에서 기본 문구 "바로 이동"을 쓴다.
alter table projects add column if not exists link_label text;
alter table studies add column if not exists link_label text;
