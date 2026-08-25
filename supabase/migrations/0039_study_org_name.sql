-- Study 리스트 카드에서 라벨과 타이틀 사이에 노출할 모임 이름.
alter table studies add column if not exists org_name text;
