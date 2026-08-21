-- MINJI 포트폴리오 — About 연혁에 '학원' 타입 추가 (Figma '최종' 시안: 회사/학원/어학연수/학교 4종)
alter type career_type add value if not exists 'academy';
