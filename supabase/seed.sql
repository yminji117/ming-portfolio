-- MINJI 포트폴리오 — 시드 데이터
-- 아래 값은 Main 화면 개발(Phase 1)을 실데이터로 바로 진행하기 위한 플레이스홀더입니다.
-- 실제 이메일/인스타그램/이미지 등은 어드민(Phase 3) 완성 후 직접 교체해주세요.

-- site_settings
insert into site_settings (id, hero_title, hero_subtitle, hero_media_type, currently_limit)
values (true, 'Welcome To My Home', '기획하고 만드는 사람, 윤민지입니다.', 'image', 6);

-- about
insert into about (id, name_ko, name_en, tagline, cover_letter, cover_letter_summary, email, instagram_url)
values (
  true,
  '윤민지',
  'Yoon Minji',
  '기획하고 만드는 사람',
  '(전문 자기소개 — 어드민에서 작성해주세요)',
  '기획과 실행을 함께 하는 것을 좋아합니다.',
  'hello@example.com',
  'https://instagram.com/'
);

-- careers
insert into careers (type, org_name, title, start_date, end_date, "order") values
  ('company', '회사명 A', '기획', '2024-01-01', null, 1),
  ('company', '회사명 B', '기획', '2022-03-01', '2023-12-31', 2),
  ('school', '학교명', '전공', '2018-03-01', '2022-02-01', 3),
  ('language', '어학연수 기관', null, '2021-06-01', '2021-12-01', 4);

-- skills (PRD 6.4 — Pigma는 Figma 오기로 반영, 부록 A/Open Question #1)
insert into skills (name, "group", "order") values
  ('Figma', 'main', 1),
  ('Notion', 'main', 2),
  ('PPT', 'main', 3),
  ('Slack', 'sub', 4),
  ('CapCut', 'sub', 5),
  ('Adobe Illustrator', 'sub', 6),
  ('Adobe Photoshop', 'sub', 7);

-- projects — Professional 3건 (Main 3영역 정원)
insert into projects (slug, category, title, summary, company, role, tools, start_date, end_date, overview, is_featured, featured_order, status) values
  ('professional-project-1', 'professional', 'Professional 프로젝트 1', '한 줄 요약을 입력해주세요', '회사명 A', array['기획','UX'], array['Figma','Notion'], '2024-01-01', null, '프로젝트 개요', true, 1, 'published'),
  ('professional-project-2', 'professional', 'Professional 프로젝트 2', '한 줄 요약을 입력해주세요', '회사명 A', array['기획'], array['Figma'], '2023-06-01', '2023-12-31', '프로젝트 개요', true, 2, 'published'),
  ('professional-project-3', 'professional', 'Professional 프로젝트 3', '한 줄 요약을 입력해주세요', '회사명 B', array['기획','운영'], array['Notion'], '2022-06-01', '2023-02-28', '프로젝트 개요', true, 3, 'published');

-- projects — Side 4건 (Main 5영역 정원)
insert into projects (slug, category, title, summary, role, tools, start_date, end_date, overview, is_featured, featured_order, status) values
  ('side-project-1', 'side', 'Side 프로젝트 1', '한 줄 요약을 입력해주세요', array['기획','디자인'], array['Figma'], '2025-01-01', null, '프로젝트 개요', true, 1, 'published'),
  ('side-project-2', 'side', 'Side 프로젝트 2', '한 줄 요약을 입력해주세요', array['기획'], array['Figma'], '2024-09-01', '2024-12-01', '프로젝트 개요', true, 2, 'published'),
  ('side-project-3', 'side', 'Side 프로젝트 3', '한 줄 요약을 입력해주세요', array['기획'], array['Notion'], '2024-03-01', '2024-06-01', '프로젝트 개요', true, 3, 'published'),
  ('side-project-4', 'side', 'Side 프로젝트 4', '한 줄 요약을 입력해주세요', array['기획','운영'], array['Notion'], '2023-11-01', '2024-01-31', '프로젝트 개요', true, 4, 'published');

-- 비노출 테스트용 draft 1건 (Works 리스트/필터 확인용)
insert into projects (slug, category, title, summary, status) values
  ('draft-project-1', 'side', '작성중 프로젝트', '아직 게시되지 않은 항목', 'draft');

-- studies — 5건 (Main 4영역 정원)
insert into studies (slug, title, summary, tags, published_at, is_featured, featured_order, status) values
  ('study-1', 'Study 게시물 1', '한 줄 요약을 입력해주세요', array['UX'], '2026-07-01', true, 1, 'published'),
  ('study-2', 'Study 게시물 2', '한 줄 요약을 입력해주세요', array['아티클'], '2026-06-15', true, 2, 'published'),
  ('study-3', 'Study 게시물 3', '한 줄 요약을 입력해주세요', array['강의'], '2026-05-20', true, 3, 'published'),
  ('study-4', 'Study 게시물 4', '한 줄 요약을 입력해주세요', array['회고'], '2026-04-10', true, 4, 'published'),
  ('study-5', 'Study 게시물 5', '한 줄 요약을 입력해주세요', array['UX'], '2026-03-05', true, 5, 'published');

-- currently_doing — 6건 (Main 7영역 기본 노출 개수)
-- "order"는 운영자가 수동 지정하기 전까지 null로 두어, PRD 5.7의 기본 자동 정렬
-- (라벨 우선순위 진행중→하고싶다→완료 → 동일 라벨 내 시작일 최신순)이 적용되도록 한다.
insert into currently_doing (category, title, label, start_date, end_date, is_visible) values
  ('works', '포트폴리오 사이트 개발', 'doing', '2026-08-13', null, true),
  ('study', 'UX 리서치 스터디', 'doing', '2026-07-01', null, true),
  ('side', '사이드 프로젝트 기획', 'want', null, null, true),
  ('works', '이전 프로젝트 A', 'done', '2025-01-01', '2025-06-30', true),
  ('study', '읽고 싶은 아티클 정리', 'want', null, null, true),
  ('side', '사이드 프로젝트 B', 'done', '2024-09-01', '2024-12-01', true);

-- guestbook — 샘플 2건 (비밀번호: 1234, bcrypt cost 10 — PRD 8.2 password_hash 규격)
insert into guestbook (nickname, content, password_hash) values
  ('minji_friend', '방명록 테스트 내용입니다.', crypt('1234', gen_salt('bf', 10))),
  ('hong2', '두번째 방명록 테스트입니다.', crypt('1234', gen_salt('bf', 10)));
