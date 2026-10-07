-- Work 상세 페이지 "바로가기" 버튼을 하나 더 추가하기 위한 두 번째 링크.
-- studies.related_url과 이름은 비슷해 보이지만 용도가 다르다(그쪽은 버튼이 아니라
-- 소속 텍스트의 밑줄 링크) — 혼동 방지를 위해 별도 이름을 쓴다.
alter table projects add column if not exists secondary_url text;
alter table projects add column if not exists secondary_link_label text;
