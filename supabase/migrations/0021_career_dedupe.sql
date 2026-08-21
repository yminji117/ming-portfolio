-- MINJI 포트폴리오 — '리메인' 학원 항목이 실수로 중복 등록된 것을 정리 (가장 오래된 1건만 남김)
delete from careers
where org_name = '리메인'
  and type = 'academy'
  and id not in (
    select id from careers
    where org_name = '리메인' and type = 'academy'
    order by created_at asc
    limit 1
  );
