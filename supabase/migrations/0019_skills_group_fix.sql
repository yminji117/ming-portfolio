-- MINJI 포트폴리오 — Skills 주 사용/사용 가능 그룹을 Figma '최종' 시안대로 교정
-- 피그마: 주 사용 = Figma, PPT, Slack / 사용 가능 = Notion, CapCut, Adobe Illustrator, Adobe Photoshop
update skills set "group" = 'sub' where name = 'Notion';
update skills set "group" = 'main' where name = 'Slack';
