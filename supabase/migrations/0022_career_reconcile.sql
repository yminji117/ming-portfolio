-- MINJI 포트폴리오 — 연혁 데이터 정합성 복구 (몇 번 실행해도 안전, 실행 후 항상 같은 결과)
-- 1) 학원 3건(리메인/정글 아카데미/일산 컴퓨터 학원) 중복 제거 — 각각 가장 오래된 1건만 남김
delete from careers a
using careers b
where a.type = 'academy'
  and b.type = 'academy'
  and a.org_name = b.org_name
  and a.created_at > b.created_at;

-- 2) 어학연수(중국 서안+북경) — 없으면 새로 추가, 있으면 값만 맞춰준다
insert into careers (type, org_name, description, start_date, end_date, "order")
select 'language', '중국 (서안+북경)', '1학기 서안대학교 + 2학기 북경어언대학교', '2017-02-01', '2017-12-31', 6
where not exists (select 1 from careers where org_name = '중국 (서안+북경)');

update careers set
  description = '1학기 서안대학교 + 2학기 북경어언대학교',
  start_date = '2017-02-01',
  end_date = '2017-12-31'
where org_name = '중국 (서안+북경)';

-- 3) 학교(대학교 학사 취득) — 없으면 새로 추가, 있으면 값만 맞춰준다
insert into careers (type, org_name, start_date, end_date, "order")
select 'school', '대학교 학사 취득', '2012-03-02', '2016-02-28', 7
where not exists (select 1 from careers where org_name = '대학교 학사 취득');

update careers set
  title = null,
  description = null,
  start_date = '2012-03-02',
  end_date = '2016-02-28'
where org_name = '대학교 학사 취득';

-- 4) 혹시 예전 플레이스홀더('어학연수 기관', '학교명')가 남아있다면 제거
delete from careers where org_name in ('어학연수 기관', '학교명');
