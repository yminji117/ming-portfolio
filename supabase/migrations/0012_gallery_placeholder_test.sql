-- MINJI 포트폴리오 — Works 상세 페이지 IMAGE 갤러리 섹션 레이아웃 확인용 (테스트 전용)
-- public/gallery-placeholder.png(회색 박스, 리스트 카드 placeholder와 동일 톤)를 4장 채워
-- 실제 사진 없이도 갤러리 섹션이 뜨는지 확인한다. 실제 사진을 Storage에 올리면
-- 이 값을 그 URL 배열로 덮어써서 교체하면 된다.
update projects set gallery_urls = array[
  '/gallery-placeholder.png',
  '/gallery-placeholder.png',
  '/gallery-placeholder.png',
  '/gallery-placeholder.png'
]
where slug = 'professional-project-1';
