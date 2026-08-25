-- MINJI 포트폴리오 — Study "게시일"(단일 날짜) 삭제 → "기간"(start_date~end_date)으로 교체
-- Works의 projects.start_date/end_date와 동일한 구조. 기존 published_at 값은 start_date로 이관한다.

alter table studies add column start_date date;
alter table studies add column end_date date;

update studies set start_date = published_at;

alter table studies drop column published_at;

alter table studies
  add constraint studies_date_order check (end_date is null or start_date is null or end_date >= start_date);
