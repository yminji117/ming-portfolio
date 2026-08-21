-- MINJI 포트폴리오 — Study 상세 페이지 IMAGE 섹션 (Figma 시안 반영, Works의 gallery_urls와 동일 패턴)
alter table studies add column if not exists gallery_urls text[];

-- 렌더링 확인용 테스트 값 — 실제 이미지 준비되면 교체
update studies set gallery_urls = array[
  '/gallery-placeholder.png',
  '/gallery-placeholder.png',
  '/gallery-placeholder.png',
  '/gallery-placeholder.png'
]
where slug = 'study-1';
