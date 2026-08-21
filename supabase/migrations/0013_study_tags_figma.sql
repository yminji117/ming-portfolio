-- MINJI 포트폴리오 — Study 필터 칩을 Figma '최종' 시안 값(AI/Data/Online/Offline)으로 교체
-- 기존 UX/강의/아티클/회고 태그는 시안 확정 전 임시값이었음 — Figma 예시 조합 그대로 반영
update studies set tags = array['AI', 'Online'] where slug = 'study-1';
update studies set tags = array['Data', 'Online'] where slug = 'study-2';
update studies set tags = array['AI', 'Offline'] where slug = 'study-3';
update studies set tags = array['Data'] where slug = 'study-4';
update studies set tags = array['AI'] where slug = 'study-5';
