-- MINJI 포트폴리오 — 일산 컴퓨터 학원 자격증 표시를 Figma처럼 태그+텍스트로 분리 렌더링하도록 코드가 바뀌어서,
-- description에 남아있던 "자격증: " 접두어를 제거한다(태그 라벨이 대신 보여준다).
update careers set description = '컴퓨터그래픽스운용기능사, GTQ 1급 취득'
where org_name = '일산 컴퓨터 학원';
