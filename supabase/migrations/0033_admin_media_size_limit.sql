-- MINJI 포트폴리오 — 어드민 이미지 업로드 용량 제한 상향 (5MB → 20MB)
-- 0031_admin_media_storage.sql에서 만든 media 버킷의 file_size_limit만 갱신한다.

update storage.buckets
set file_size_limit = 20971520
where id = 'media';
