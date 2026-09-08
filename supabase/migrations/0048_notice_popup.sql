-- 공지 팝업(NoticePopup) 문구/노출 여부를 어드민에서 관리하기 위한 컬럼 추가.
-- default 값은 기존에 컴포넌트에 하드코딩돼 있던 문구 그대로 — 마이그레이션 후에도 동작 동일.
alter table site_settings
  add column notice_enabled  boolean not null default true,
  add column notice_emoji    text    not null default '🚨',
  add column notice_title    text    not null default '아직 수정 중으로 서버 오류가 날 수 있어요!',
  add column notice_subtitle text    not null default '오류날 경우 잠시후 새로고침 해주세요.
감사합니다 :-)';
