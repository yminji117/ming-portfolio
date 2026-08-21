-- MINJI 포트폴리오 — About 연혁을 Figma '최종' 시안 실데이터로 채운다.
-- ⚠️ 0017_career_academy_type.sql(career_type에 'academy' 추가)을 먼저 적용해야 한다.

-- 기존에 플레이스홀더로 남아있던 어학연수/학교 항목을 실제 값으로 교체
update careers set
  org_name = '중국 (서안+북경)',
  description = '1학기 서안대학교 + 2학기 북경어언대학교',
  start_date = '2017-02-01',
  end_date = '2017-12-31',
  "order" = 6
where type = 'language';

update careers set
  org_name = '대학교 학사 취득',
  title = null,
  description = null,
  start_date = '2012-03-02',
  end_date = '2016-02-28',
  "order" = 7
where type = 'school';

-- 피그마에만 있고 아직 등록 안 된 학원 3건 추가
insert into careers (type, org_name, title, description, start_date, end_date, "order") values
  ('academy', '리메인', 'Web Design, UX/APP Design', null, '2020-10-01', '2020-12-31', 3),
  ('academy', '정글 아카데미', 'UX/UI Design', null, '2019-02-01', '2019-05-31', 4),
  ('academy', '일산 컴퓨터 학원', 'UX/UI Design', '자격증: 컴퓨터그래픽스운용기능사, GTQ 1급 취득', '2018-06-01', '2018-12-31', 5);
