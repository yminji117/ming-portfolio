-- MINJI 포트폴리오 — About 섹션 회사 연혁을 Figma '최종' 시안(38:2572) 실데이터로 교체
alter table careers add column if not exists industry text;

delete from careers where type = 'company';

insert into careers (type, org_name, title, description, industry, start_date, end_date, "order") values
  ('company', '(주)언플러', 'Service Planner', '대리', '에이전시', '2021-12-27', '2026-05-22', 1),
  ('company', '(주)알다', 'Product Designer', '사원', '스타트업', '2020-09-20', '2021-06-30', 2);
