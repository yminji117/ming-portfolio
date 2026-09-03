-- 0046에서 Education→EdTech로 소급했지만, 이후에도 industry에 'Education'이 남은 프로젝트가
-- 운영 DB에 존재했다(카테고리 목록엔 없고 프로젝트 원본 값에만 남아 Front 필터/태그에 노출됨).
-- 'Education'을 'EdTech'로 마저 정리한다. 여러 번 실행해도 안전(idempotent).
update projects
set industry = (
  select array_agg(distinct case when v = 'Education' then 'EdTech' else v end)
  from unnest(industry) as v
)
where 'Education' = any(industry);
