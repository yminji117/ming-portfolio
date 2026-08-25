-- cover_url(상세 페이지 배너용으로 만들었던 컬럼)을 실제 용도인 "Front 메인 Study 영역
-- 썸네일"로 재정의한다 — /study 리스트 썸네일(thumbnail_url)과 분리하는 것이 목적이었다.
-- 아직 어떤 row에도 값이 채워지지 않은 컬럼이라 데이터 이관 없이 이름만 바꾼다.
alter table studies rename column cover_url to main_thumbnail_url;
