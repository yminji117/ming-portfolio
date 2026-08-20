-- MINJI 포트폴리오 — Main About 사진 반영
-- public/about/minji.jpg 로 About 섹션 프로필 사진 업로드에 맞춰 photo_url 갱신

update about
set photo_url = '/about/minji.jpg'
where id = true;
