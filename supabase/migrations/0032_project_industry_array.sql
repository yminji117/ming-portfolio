-- MINJI 포트폴리오 — projects.industry를 단일 값(text)에서 다중 선택(text[])으로 변경
-- 어드민에서 업종을 여러 개 고를 수 있도록 하기 위함. 기존 단일 값은 1개짜리 배열로 이관한다.
-- career.industry(연혁 업종)는 별개 컬럼이라 영향 없음.

alter table projects
  alter column industry type text[]
  using case when industry is null then null else array[industry] end;
