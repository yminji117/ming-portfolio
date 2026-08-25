-- 상세 페이지 설명(overview)을 리스트 카드 한 줄 요약(summary)과 분리한다 —
-- Works의 summary(리스트용)/overview(상세용) 구조와 동일.
alter table studies add column if not exists overview text;
