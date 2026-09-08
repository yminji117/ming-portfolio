-- 공지 팝업 노출 정책을 4가지 중 선택하도록 변경.
-- 기존 notice_enabled(불리언 제공/미제공)를 드롭하고, off를 포함한 단일 모드 컬럼으로 대체.
-- default 'once_session' = 기존 동작(세션당 1회) 유지.
alter table site_settings drop column notice_enabled;
alter table site_settings add column notice_display_mode text not null default 'once_session'
  check (notice_display_mode in ('off', 'once_session', 'every_entry', 'dismiss_12h'));
