-- 상세 페이지 설명 하단에 노출할 "관련 URL" 버튼용 링크.
-- external_url(PRD 6.3 — 채워지면 리스트/메인에서 상세 페이지를 만들지 않고 바로 외부로
-- 보내는 필드)과는 목적이 다르다 — 이 필드는 상세 페이지 자체는 그대로 보여주면서
-- 참고할 외부 링크를 덧붙이는 용도라 라우팅에는 영향을 주지 않는다.
alter table studies add column if not exists related_url text;
