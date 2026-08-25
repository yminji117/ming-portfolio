-- Study 미디어에서 리스트 썸네일(thumbnail_url)과 별개로 상세 페이지 상단 배너용
-- 메인 이미지를 등록할 수 있도록 한다 — Works의 thumbnail_url/cover_url 분리와 동일한 구조.
alter table studies add column if not exists cover_url text;
