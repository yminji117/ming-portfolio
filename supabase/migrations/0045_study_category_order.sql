-- 어드민에서 Study 카테고리 노출 순서를 바꿀 수 있도록 site_settings에 순서 저장
alter table site_settings
  add column study_category_order text[] not null default array['AI', 'Data', 'Talk'];
