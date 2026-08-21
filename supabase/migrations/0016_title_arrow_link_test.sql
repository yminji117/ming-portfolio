-- MINJI 포트폴리오 — 상세 페이지 타이틀 옆 외부 링크 화살표 렌더링 확인용 (테스트 전용)
-- Study는 이제 external_url이 있어도 상세 페이지가 리다이렉트되지 않고 그대로 보이며,
-- 타이틀 옆 화살표를 눌러야만 외부로 이동한다 (0009 이전 방식과 달라진 부분).
update projects set external_url = 'https://www.figma.com' where slug = 'professional-project-1';
update studies set external_url = 'https://www.figma.com' where slug = 'study-1';
